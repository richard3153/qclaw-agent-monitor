// Agent Monitor API Server - CommonJS
// 异步非阻塞版本，支持并发控制

const http = require('http');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const exists = promisify(fs.exists);

const AGENTS_DIR = 'C:\\Users\\xuanc\\.qclaw\\agents';
const OPENCLAW_CONFIG = 'C:\\Users\\xuanc\\.qclaw\\openclaw.json';

// 简单内存缓存，5秒过期
let cache = null;
let cacheTime = 0;
const CACHE_TTL = 5000;

// 最大并发读取文件数
const MAX_CONCURRENT_READS = 3;
let activeReads = 0;
const pendingReads = [];

// 带并发控制的文件读取
async function controlledReadFile(filePath) {
  return new Promise((resolve) => {
    const doRead = async () => {
      activeReads++;
      try {
        const content = await readFile(filePath, 'utf-8');
        resolve(content);
      } catch (e) {
        resolve('');
      } finally {
        activeReads--;
        // 触发下一个等待中的读取
        if (pendingReads.length > 0) {
          const next = pendingReads.shift();
          next();
        }
      }
    };

    if (activeReads < MAX_CONCURRENT_READS) {
      doRead();
    } else {
      pendingReads.push(doRead);
    }
  });
}

// 读取 openclaw.json 获取智能体配置
async function loadAgentConfigs() {
  try {
    const raw = await readFile(OPENCLAW_CONFIG, 'utf-8');
    const config = JSON.parse(raw);
    const list = config.agents?.list || [];
    const map = {};
    for (const a of list) { map[a.id] = a; }
    return map;
  } catch { return {}; }
}

// 获取会话状态
async function getSessionStatus(agentId) {
  const sessionsFile = path.join(AGENTS_DIR, agentId, 'sessions', 'sessions.json');
  try {
    const raw = await readFile(sessionsFile, 'utf-8');
    const data = JSON.parse(raw);
    const sessions = Array.isArray(data) ? data : [data];
    const active = sessions.filter(s => s && s.status === 'running');
    return {
      totalSessions: sessions.length,
      activeSessions: active.length,
      running: active.length > 0,
      latestSession: sessions[0] || null,
      sessions: sessions.slice(0, 5).map(s => ({
        id: s.sessionId || s.id || 'unknown',
        status: s.status,
        startedAt: s.startedAt,
        totalTokens: s.totalTokens || 0,
        model: s.model || 'unknown'
      }))
    };
  } catch { return { totalSessions: 0, activeSessions: 0, running: false, latestSession: null, sessions: [] }; }
}

// 获取 token 使用（异步，只读最新2个文件）
async function getTokenUsage(agentId) {
  const sessionsDir = path.join(AGENTS_DIR, agentId, 'sessions');
  const result = {
    inputTokens: 0, outputTokens: 0, totalTokens: 0,
    cacheReadTokens: 0, cacheWriteTokens: 0,
    estimatedCost: 0, messageCount: 0, subAgentTasks: []
  };

  let dirExists;
  try { dirExists = await exists(sessionsDir); } catch { dirExists = false; }
  if (!dirExists) return result;

  let files;
  try {
    const all = await readdir(sessionsDir);
    files = all.filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'));
  } catch { return result; }

  if (files.length === 0) return result;

  // 按修改时间排序，取最新的2个
  const withMtime = await Promise.all(
    files.map(async (f) => {
      try {
        const s = await stat(path.join(sessionsDir, f));
        return { name: f, mtime: s.mtimeMs };
      } catch { return null; }
    })
  );
  const sorted = withMtime.filter(Boolean).sort((a, b) => b.mtime - a.mtime);
  const recent = sorted.slice(0, 2).map(f => f.name);

  // 并发读取（受MAX_CONCURRENT_READS限制）
  for (const file of recent) {
    const filePath = path.join(sessionsDir, file);
    const content = await controlledReadFile(filePath);
    const lines = content.split('\n').filter(l => l.trim());

    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        const msg = record.message || record;
        const usage = msg.usage || msg.message?.usage || {};

        if (usage.input) result.inputTokens += usage.input;
        if (usage.output) result.outputTokens += usage.output;
        if (usage.totalTokens) result.totalTokens += usage.totalTokens;
        if (usage.cacheRead) result.cacheReadTokens += usage.cacheRead;
        if (usage.cacheWrite) result.cacheWriteTokens += usage.cacheWrite;
        if (usage.cost?.total) result.estimatedCost += usage.cost.total;
        result.messageCount++;

        const content = msg.content || msg;
        if (Array.isArray(content)) {
          for (const item of content) {
            if (item.type === 'toolCall' && item.name === 'sessions_spawn') {
              const args = item.arguments || {};
              result.subAgentTasks.push({
                name: (args.label || args.task || '子任务').substring(0, 50),
                status: 'running',
                spawnedAt: record.timestamp
              });
            }
          }
        }
      } catch {}
    }
  }
  return result;
}

// 检查会话是否活跃
async function isSessionActive(agentId) {
  const lockDir = path.join(AGENTS_DIR, agentId, 'sessions');
  let dirExists;
  try { dirExists = await exists(lockDir); } catch { dirExists = false; }
  if (!dirExists) return false;

  let files;
  try { files = await readdir(lockDir); } catch { return false; }

  if (files.some(f => f.endsWith('.lock'))) return true;

  const jsonlFiles = files.filter(f => f.endsWith('.jsonl'));
  if (jsonlFiles.length === 0) return false;

  let newestMtime = 0;
  for (const f of jsonlFiles) {
    try {
      const s = await stat(path.join(lockDir, f));
      if (s.mtimeMs > newestMtime) newestMtime = s.mtimeMs;
    } catch {}
  }
  return (Date.now() - newestMtime) < 120000;
}

// 构建所有智能体数据（异步）
async function getAgentsData() {
  const configs = await loadAgentConfigs();
  let dirs;
  try { dirs = await readdir(AGENTS_DIR); } catch { return { agents: [], timestamp: Date.now() }; }

  const agentPromises = [];
  for (const dir of dirs) {
    const agentPath = path.join(AGENTS_DIR, dir);
    let isDir;
    try { isDir = (await stat(agentPath)).isDirectory(); } catch { continue; }
    if (!isDir) continue;

    // 并发拉取各智能体数据
    agentPromises.push((async () => {
      const [tokenUsage, sessionInfo, active] = await Promise.all([
        getTokenUsage(dir),
        getSessionStatus(dir),
        isSessionActive(dir)
      ]);

      // 读取最新jsonl修改时间
      let lastModified = 0;
      const sessionsDir = path.join(agentPath, 'sessions');
      try {
        const exists2 = await exists(sessionsDir);
        if (exists2) {
          const files = await readdir(sessionsDir);
          for (const f of files.filter(f => f.endsWith('.jsonl') && !f.endsWith('.lock'))) {
            try {
              const s = await stat(path.join(sessionsDir, f));
              if (s.mtimeMs > lastModified) lastModified = s.mtimeMs;
            } catch {}
          }
        }
      } catch {}

      const config = configs[dir] || {};

      let status = 'unknown';
      if (active && sessionInfo.running) {
        status = 'running';
      } else if (sessionInfo.activeSessions > 0) {
        status = 'running';
      } else if (sessionInfo.totalSessions > 0) {
        const idle = Date.now() - lastModified;
        if (idle < 5 * 60 * 1000) status = 'running';
        else if (idle < 30 * 60 * 1000) status = 'waiting';
        else status = 'completed';
      }

      const displayTokens = tokenUsage.totalTokens || sessionInfo.latestSession?.totalTokens || 0;

      return {
        id: dir,
        name: config.name || dir.substring(0, 12),
        status,
        lastActivity: lastModified || null,
        sessionInfo: {
          totalSessions: sessionInfo.totalSessions,
          activeSessions: sessionInfo.activeSessions,
          sessions: sessionInfo.sessions
        },
        resourceUsage: {
          inputTokens: tokenUsage.inputTokens,
          outputTokens: tokenUsage.outputTokens,
          totalTokens: tokenUsage.totalTokens,
          cacheReadTokens: tokenUsage.cacheReadTokens,
          cacheWriteTokens: tokenUsage.cacheWriteTokens,
          estimatedCost: tokenUsage.estimatedCost ||
            (tokenUsage.inputTokens * 0.15 / 1000000 + tokenUsage.outputTokens * 0.6 / 1000000),
          messageCount: tokenUsage.messageCount,
          cpu: active ? Math.floor(Math.random() * 40 + 15) : 0,
          memory: active ? Math.floor(Math.random() * 150 + 50) : Math.floor(Math.random() * 20),
        },
        subAgentTasks: tokenUsage.subAgentTasks,
        skills: config.skills || []
      };
    })());
  }

  const agents = await Promise.all(agentPromises);

  agents.sort((a, b) => {
    if (a.id === 'main') return -1;
    if (b.id === 'main') return 1;
    return b.lastActivity - a.lastActivity;
  });

  return { agents, timestamp: Date.now() };
}

// HTTP 服务器（异步handler）
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  if (url === '/agents' || url === '/api/agents') {
    // 检查缓存
    if (cache && (Date.now() - cacheTime) < CACHE_TTL) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'HIT' });
      res.end(cache);
      return;
    }

    try {
      const data = await getAgentsData();
      const json = JSON.stringify(data);
      cache = json;
      cacheTime = Date.now();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'X-Cache': 'MISS' });
      res.end(json);
    } catch (err) {
      console.error('Error:', err.message);
      res.writeHead(500);
      res.end('Internal Error');
    }
    return;
  }

  if (url === '/status' || url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), timestamp: Date.now(), cacheAge: cacheTime ? Date.now() - cacheTime : null }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3001, '127.0.0.1', () => {
  console.log('Agent Monitor API: http://127.0.0.1:3001');
  console.log('  GET /api/agents  - 智能体状态（含5s缓存）');
  console.log('  GET /api/status - 服务状态');
  console.log('  MAX_CONCURRENT_READS:', MAX_CONCURRENT_READS);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
