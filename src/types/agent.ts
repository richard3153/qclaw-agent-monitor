// 智能体相关类型定义

export type AgentStatus = 
  | 'running'    // 运行中
  | 'waiting'   // 等待中
  | 'stuck'     // 卡住/锁死
  | 'completed' // 已完成
  | 'failed'   // 失败
  | 'unknown';  // 未知/离线

export interface SubAgentTask {
  name: string;
  status: string;
  spawnedAt: string;
}

export interface SessionInfo {
  id: string;
  status: string;
  startedAt: number;
  totalTokens: number;
  model: string;
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  lastActivity: number | null;
  sessionInfo: {
    totalSessions: number;
    activeSessions: number;
    sessions: SessionInfo[];
  };
  resourceUsage: {
    // Token 相关（实时）
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    estimatedCost: number;
    messageCount: number;
    // 估算的资源
    cpu: number;
    memory: number;
  };
  subAgentTasks: SubAgentTask[];
  skills: string[];
  stuckDetected?: boolean;
}

export interface AppSettings {
  refreshInterval: number;
  stuckThresholdMinutes: number;
}
