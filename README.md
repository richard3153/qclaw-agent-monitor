# QClaw Agent Monitor

[中文](#中文) · [English](#english)

---

## 中文

### 是什么

QClaw Agent Monitor 是一个 **QClaw / OpenClaw 智能体实时监控面板**，用于可视化本地运行的所有智能体的状态、资源使用和对话历史。

### 功能特性

- 🟢 **实时状态**：自动检测运行中 / 卡住 / 已完成的智能体
- 📊 **Token 统计**：实时追踪 input / output / cache tokens 消耗及预估费用
- 🔄 **手动刷新 + 暂停**：右上角支持手动刷新和暂停自动轮询（节省资源）
- 📁 **多智能体视图**：树状/列表视图，支持按状态分组显示
- ⚠️ **异常报警**：自动标记 30 分钟无活动的智能体为卡住状态
- 🚀 **轻量快速**：自建 Node.js API 层，直接读取文件系统，无 OpenClaw 认证依赖

### 系统架构

```
┌─────────────────────────────────────────────────────┐
│  Browser (React + Vite)  http://localhost:3000      │
│  ├─ Zustand Store (10s polling)                     │
│  └─ AgentList / AgentCard / AgentTree               │
└────────────────────┬────────────────────────────────┘
                     │ fetch /api/agents
                     │ (via Vite Proxy → 3001)
┌────────────────────▼────────────────────────────────┐
│  Node.js API Server  http://127.0.0.1:3001          │
│  ├─ 5s 内存缓存 (减少磁盘 I/O)                        │
│  ├─ 异步文件读取 (不阻塞事件循环)                      │
│  └─ 并发控制 (最多 3 个文件并发)                      │
└────────────────────┬────────────────────────────────┘
                     │ fs.readdir / readFile
┌────────────────────▼────────────────────────────────┐
│  OpenClaw Data  (~/.qclaw/agents/)                 │
│  ├─ sessions.json (会话列表)                         │
│  └─ *.jsonl (每会话一条 JSONL 日志)                   │
└─────────────────────────────────────────────────────┘
```

### 安装与启动

#### 前置条件

- Node.js ≥ 18
- QClaw / OpenClaw 已安装并运行
- GitHub Personal Access Token（有写入权限）

#### 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/richard3153/qclaw-agent-monitor.git
cd qclaw-agent-monitor

# 2. 安装依赖
npm install

# 3. 配置 Token（如果需要上传）
# 将 GitHub PAT 写入 token.txt（不上传到 GitHub）
echo "ghp_your_token_here" > token.txt

# 4. 启动 API 服务器（后台）
node server/agent-server.cjs

# 5. 启动前端（另一个终端）
npm run dev

# 6. 打开浏览器
# http://localhost:3000
```

#### 一键上传到 GitHub（可选）

如果修改了代码，想同步到 GitHub 仓库：

```bash
node upload.cjs
```

> upload.cjs 会自动跳过 node_modules、.vite、.git 等非源码文件，只上传源代码。

### 端口说明

| 端口  | 服务               | 说明                          |
|-------|-------------------|-------------------------------|
| 3000  | Vite 开发服务器    | 前端界面                      |
| 3001  | Agent API Server  | 读取 ~.qclaw/agents/ 数据     |
| 28789 | OpenClaw Gateway  | QClaw 原生 Web UI（不需要）  |

### 文件结构

```
qclaw-agent-monitor/
├── server/
│   └── agent-server.cjs    # Node.js API 服务器（核心）
├── src/
│   ├── api/
│   │   └── client.ts       # 前端 API 客户端
│   ├── components/
│   │   ├── AgentCard.tsx   # 智能体卡片
│   │   ├── AgentList.tsx  # 智能体列表（分组视图）
│   │   ├── AgentNode.tsx  # 树状节点
│   │   ├── AgentTree.tsx  # 树状结构视图
│   │   ├── AlertPanel.tsx # 报警面板
│   │   ├── ProgressBar.tsx
│   │   ├── ResourceStats.tsx
│   │   └── StatusBadge.tsx
│   ├── store/
│   │   └── agentStore.ts  # Zustand 状态管理
│   ├── types/
│   │   └── agent.ts       # TypeScript 类型定义
│   ├── App.tsx            # 主应用入口
│   └── main.tsx
├── upload.cjs             # GitHub 上传脚本
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

### 常见问题

**Q: "failed to fetch" 错误？**
> 检查 API 服务器是否运行：`curl http://127.0.0.1:3001/api/agents`
> 如果返回 200，检查 Vite 是否正在运行（`npm run dev`）

**Q: 看不到数据？**
> 确认 QClaw 正在运行，且 `~/.qclaw/agents/` 目录下有智能体会话文件

**Q: 浏览器卡顿？**
> 点击右上角 "暂停" 按钮停止自动刷新，手动刷新即可

---

## English

### What is it

**QClaw Agent Monitor** is a real-time monitoring dashboard for [QClaw / OpenClaw](https://github.com/openclaw) AI agents, visualizing the status, resource usage, and conversation history of all local agents.

### Features

- 🟢 **Real-time Status**: Auto-detect running / stuck / completed agents
- 📊 **Token Tracking**: Live input/output/cache token counts and estimated cost
- 🔄 **Manual Refresh + Pause**: Top-right buttons to manually refresh or pause auto-polling
- 📁 **Multi-agent View**: Tree and list views, grouped by status
- ⚠️ **Alert System**: Auto-flag agents inactive for 30+ minutes as "stuck"
- 🚀 **Lightweight & Fast**: Custom Node.js API layer, reads filesystem directly (no OpenClaw auth required)

### Quick Start

```bash
git clone https://github.com/richard3153/qclaw-agent-monitor.git
cd qclaw-agent-monitor
npm install

# Terminal 1: Start API server
node server/agent-server.cjs

# Terminal 2: Start frontend
npm run dev

# Open http://localhost:3000
```

### Architecture

- **Frontend**: React + Vite + Zustand (polls every 10s)
- **API Server**: Node.js (port 3001), reads `~/.qclaw/agents/` directly
- **Proxy**: Vite proxies `/api/*` → `http://127.0.0.1:3001`
- **Cache**: 5-second in-memory cache to reduce disk I/O
- **Async**: Fully non-blocking, max 3 concurrent file reads

### Upload to GitHub

```bash
node upload.cjs
```

---

## License

MIT
