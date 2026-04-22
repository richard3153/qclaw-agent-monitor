// OpenClaw Agent Monitor API 客户端
// 使用相对路径，通过 Vite 代理转发到后端 API

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export interface AgentApiResponse {
  agents: ApiAgent[];
  timestamp: number;
}

export interface ApiAgent {
  id: string;
  name: string;
  status: string;
  lastActivity: number | null;
  sessionInfo: {
    totalSessions: number;
    activeSessions: number;
    sessions: Array<{
      id: string;
      status: string;
      startedAt: number;
      totalTokens: number;
      model: string;
    }>;
  };
  resourceUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cacheReadTokens: number;
    cacheWriteTokens: number;
    estimatedCost: number;
    messageCount: number;
    cpu: number;
    memory: number;
  };
  subAgentTasks: Array<{ name: string; status: string; spawnedAt: string }>;
  skills: string[];
}

// 获取所有智能体
export async function getAgents(): Promise<AgentApiResponse> {
  return fetchJson<AgentApiResponse>('/agents');
}

// 获取服务状态
export async function getStatus() {
  return fetchJson<{ status: string; uptime: number; timestamp: number }>('/status');
}
