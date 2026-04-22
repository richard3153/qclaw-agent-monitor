// 智能体状态管理 (Zustand)

import { create } from 'zustand';
import { Agent, AgentStatus } from '../types/agent';
import * as api from '../api/client';

interface AgentStore {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  lastRefresh: number;
  autoRefresh: boolean;  // 自动刷新开关
  refreshInterval: number;  // 顶层，方便读取
  settings: { refreshInterval: number; stuckThresholdMinutes: number };
  
  setAutoRefresh: (v: boolean) => void;
  setSettings: (s: Partial<AgentStore['settings']>) => void;
  refresh: () => Promise<void>;
}

const defaultSettings = {
  refreshInterval: 10000,  // 10秒刷新
  stuckThresholdMinutes: 5,
};

function mapStatus(raw: string, lastActivity: number | null): AgentStatus {
  if (raw === 'running' && lastActivity) {
    const idle = Date.now() - lastActivity;
    if (idle > 30 * 60 * 1000) return 'stuck';
  }
  const map: Record<string, AgentStatus> = {
    running: 'running',
    waiting: 'waiting',
    stuck: 'stuck',
    completed: 'completed',
    failed: 'failed',
    unknown: 'unknown',
  };
  return map[raw] || 'unknown';
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  loading: false,
  error: null,
  lastRefresh: 0,
  autoRefresh: true,
  refreshInterval: defaultSettings.refreshInterval,
  settings: defaultSettings,
  
  setAutoRefresh: (v) => set({ autoRefresh: v }),
  
  setSettings: (s) => set(state => ({ settings: { ...state.settings, ...s } })),
  
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getAgents();
      const agents: Agent[] = data.agents.map(a => ({
        ...a,
        status: mapStatus(a.status, a.lastActivity),
      }));
      set({ agents, loading: false, lastRefresh: Date.now() });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : '获取数据失败', loading: false });
    }
  },
}));
