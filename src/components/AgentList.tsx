// 智能体列表组件

import { useAgentStore } from '../store/agentStore';
import { AgentCard } from './AgentCard';
import { AlertPanel } from './AlertPanel';
import './AgentList.css';

export function AgentList() {
  const { agents, loading, error, lastRefresh } = useAgentStore();
  
  // 按状态分组
  const running = agents.filter(a => a.status === 'running');
  const stuck = agents.filter(a => a.status === 'stuck');
  const completed = agents.filter(a => a.status === 'completed');
  const others = agents.filter(a => !['running', 'stuck', 'completed'].includes(a.status));
  
  return (
    <div className="agent-list">
      <AlertPanel />
      
      {error && (
        <div className="list-error">
          ❌ {error}
          <button className="retry-btn" onClick={() => useAgentStore.getState().refresh()}>
            重试
          </button>
        </div>
      )}
      
      {lastRefresh > 0 && (
        <div className="list-header">
          <span className="header-stats">
            共 {agents.length} 个智能体
            {running.length > 0 && <span className="stat-running"> · {running.length} 运行中</span>}
            {stuck.length > 0 && <span className="stat-stuck"> · {stuck.length} 卡住</span>}
          </span>
          <span className="header-refresh">
            {loading ? '🔄 刷新中...' : `更新于 ${new Date(lastRefresh).toLocaleTimeString('zh-CN')}`}
          </span>
        </div>
      )}
      
      {running.length > 0 && (
        <div className="list-section">
          <div className="section-title">🟢 运行中 ({running.length})</div>
          {running.map(a => <AgentCard key={a.id} agent={a} />)}
        </div>
      )}
      
      {stuck.length > 0 && (
        <div className="list-section">
          <div className="section-title section-stuck">🔴 卡住 ({stuck.length})</div>
          {stuck.map(a => <AgentCard key={a.id} agent={a} />)}
        </div>
      )}
      
      {completed.length > 0 && (
        <div className="list-section">
          <div className="section-title">🔵 已完成 ({completed.length})</div>
          {completed.map(a => <AgentCard key={a.id} agent={a} />)}
        </div>
      )}
      
      {others.length > 0 && (
        <div className="list-section">
          <div className="section-title">⚪ 其他 ({others.length})</div>
          {others.map(a => <AgentCard key={a.id} agent={a} />)}
        </div>
      )}
      
      {agents.length === 0 && !loading && (
        <div className="list-empty">
          <span className="empty-icon">🤖</span>
          <span>暂无智能体数据</span>
        </div>
      )}
    </div>
  );
}
