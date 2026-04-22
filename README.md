# 🔭 qclaw-agent-monitor

> English | [中文](#中文)

A real-time monitoring dashboard for [QClaw](https://github.com/) / OpenClaw agents. Track token consumption, CPU/memory usage, session activity, and more.

## Features | 功能特点

- **Real-time Agent Status** — Instantly see which agents are running, idle, or completed
- **Live Token Tracking** — Input, output, cache read/write tokens with cost estimation
- **Resource Monitor** — CPU and memory estimates per agent
- **Session History** — Session count, active sessions, last activity time
- **Skill Detection** — Auto-detect installed skills per agent
- **Dark Theme UI** — Clean, modern dark interface built with React + Vite

## 安装 | Installation

```bash
# 克隆仓库
git clone https://github.com/richard3153/qclaw-agent-monitor.git
cd qclaw-agent-monitor

# 安装依赖
npm install

# 启动后端 API 服务（端口 3001）
node server/agent-server.cjs

# 启动前端（另一个终端，端口 3000）
npm run dev
```

Then open **http://localhost:3000**

## 适用场景 | Use Cases

- **运维监控** — 监控多智能体运行状态，无需登录 Gateway UI
- **成本分析** — 按智能体统计 Token 消耗和估算费用
- **调试诊断** — 查看各智能体的 Session 活动和问题排查
- **团队协作** — 大屏展示团队所有智能体健康状态

## 使用方法 | Usage

1. 启动后端服务 `node server/agent-server.cjs`
2. 启动前端 `npm run dev`
3. 打开 http://localhost:3000 查看监控面板
4. 数据每 10 秒自动刷新（可配置）

## 项目结构 | Project Structure

```
qclaw-agent-monitor/
├── server/
│   └── agent-server.cjs   # Node.js API 服务，读取 QClaw 本地数据
├── src/
│   ├── api/client.ts      # API 客户端
│   ├── components/        # React 组件
│   ├── store/             # Zustand 状态管理
│   └── types/agent.ts     # TypeScript 类型定义
├── index.html
├── package.json
├── vite.config.ts
└── SPEC.md               # 详细设计规范
```

## 技术栈 | Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State**: Zustand
- **Styling**: CSS (dark theme)
- **Backend**: Node.js (CommonJS) — 直接读取 QClaw 本地数据文件

## 依赖说明 | Dependencies

QClaw/OpenClaw Agent Monitor 读取以下本地数据源（无需额外 API Key）：

- `~/.qclaw/openclaw.json` — 智能体配置和 Skills 列表
- `~/.qclaw/agents/<agent-id>/sessions/sessions.json` — 会话信息
- `~/.qclaw/agents/<agent-id>/sessions/*.jsonl` — 实时 Token 统计

---

# 🔭 QClaw 智能体监控面板

[English](#english) | 中文

实时监控 QClaw / OpenClaw 平台上的所有智能体，包括运行状态、Token 消耗、资源使用、Session 活动等。

## 快速开始

```bash
# 安装
npm install

# 启动 API 服务（端口 3001）
node server/agent-server.cjs

# 启动前端（端口 3000）
npm run dev
# 或
npm run build && npx serve dist -p 3000
```

打开 http://localhost:3000

## 主要功能

| 功能 | 说明 |
|------|------|
| 智能体状态 | running / idle / completed 实时状态 |
| Token 统计 | input / output / cache read+write 分项统计 |
| 费用估算 | 基于 GPT-4o-mini 费率估算费用 |
| CPU / 内存 | 基于活跃度的资源估算 |
| Session 活动 | 会话数量、活跃会话、最后活动时间 |
| Skills | 自动检测各智能体安装的技能 |
| 自动刷新 | 每 10 秒自动刷新数据 |

## 数据源

监控面板直接读取 QClaw 本地数据目录，**无需任何额外配置**：

```
C:\Users\<user>\.qclaw\
├── openclaw.json              # 全局配置
└── agents\
    └── <agent-id>\
        └── sessions\
            ├── sessions.json   # 会话列表
            └── *.jsonl         # 消息历史（Token 统计）
```

## License

MIT

## Topics

`qclaw` `openclaw` `agent-monitor` `token-tracker` `dashboard` `react` `vite`
