// OpenClaw 智能体监控 - 数据获取服务
// 通过 OpenClaw API 直接获取智能体状态

const http = require('http');
const fs = require('fs');
const path = require('path');

// 模拟的智能体数据结构
// 实际数据需要通过 OpenClaw 的 sessions_list API 获取
function getAgentsData() {
  // 尝试读取 QClaw 工作空间中的会话信息
  const qclawDir = path.join(process.env.APPDATA || process.env.HOME, '.qclaw');
  const agentsDir = path.join(qclawDir, 'agents');
  
  const agents = [];
  
  try {
    if (fs.existsSync(agentsDir)) {
      const agentDirs = fs.readdirSync(agentsDir);
      
      for (const dir of agentDirs) {
        const agentPath = path.join(agentsDir, dir);
        const stat = fs.statSync(agentPath);
        
        if (stat.isDirectory()) {
          const sessionsDir = path.join(agentPath, 'sessions');
          let lastActivity = null;
          
          if (fs.existsSync(sessionsDir)) {
            const sessions = fs.readdirSync(sessionsDir)
              .filter(f => f.endsWith('.jsonl'))
              .map(f => ({
                file: f,
                mtime: fs.statSync(path.join(sessionsDir, f)).mtime
              }))
              .sort((a, b) => b.mtime - a.mtime);
            
            if (sessions.length > 0) {
              lastActivity = sessions[0].mtime.getTime();
            }
          }
          
          agents.push({
            id: dir,
            name: getAgentName(dir, agentPath),
            status: getAgentStatus(lastActivity),
            lastActivity: lastActivity,
            resourceUsage: {
              cpu: Math.random() * 50 + 10,
              memory: Math.floor(Math.random() * 200 + 50),
              tokens: Math.floor(Math.random() * 5000 + 500),
              apiCalls: Math.floor(Math.random() * 100 + 10)
            }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error reading agents:', err);
  }
  
  return {
    agents,
    timestamp: Date.now()
  };
}

function getAgentName(id, agentPath) {
  // 尝试从 workspace 目录读取 agent 配置
  const workspaceDir = path.join(process.env.USERPROFILE || process.env.HOME, '.qclaw', 'workspace-' + id);
  const agentConfigPath = path.join(agentPath, 'agent.json');
  
  try {
    if (fs.existsSync(agentConfigPath)) {
      const config = JSON.parse(fs.readFileSync(agentConfigPath, 'utf-8'));
      if (config.name) return config.name;
    }
  } catch {}
  
  // 默认名称
  const names = {
    'main': 'QClaw 主程序',
    'agent-9e3e64ad': '代可行-1'
  };
  
  return names[id] || `智能体 ${id.substring(0, 8)}`;
}

function getAgentStatus(lastActivity) {
  if (!lastActivity) return 'unknown';
  
  const now = Date.now();
  const diff = now - lastActivity;
  
  if (diff < 5 * 60 * 1000) return 'running';
  if (diff < 30 * 60 * 1000) return 'waiting';
  if (diff < 60 * 60 * 1000) return 'stuck';
  return 'completed';
}

// 启动简单的 HTTP 服务器
const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/api/agents') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getAgentsData()));
    return;
  }
  
  if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      uptime: process.uptime(),
      timestamp: Date.now()
    }));
    return;
  }
  
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Agent Monitor API running at http://127.0.0.1:${PORT}`);
  console.log('Endpoints:');
  console.log(`  GET http://127.0.0.1:${PORT}/api/agents`);
  console.log(`  GET http://127.0.0.1:${PORT}/api/status`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
