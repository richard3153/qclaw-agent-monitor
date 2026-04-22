// 报警面板组件

import { useAgentStore } from '../store/agentStore';
import './AlertPanel.css';

export function AlertPanel() {
  const agents = useAgentStore(state => state.agents);
  const stuckAgents = agents.filter(a => a.status === 'stuck');
  
  if (stuckAgents.length === 0) return null;
  
  return (
    <div className="alert-panel">
      <div className="alert-header">
        <span className="alert-icon">⚠️</span>
        <span className="alert-title">智能体卡住警报 ({stuckAgents.length})</span>
      </div>
      <div className="alert-list">
        {stuckAgents.map(a => (
          <div key={a.id} className="alert-item">
            <span className="alert-name">{a.name}</span>
            <span className="alert-id">{a.id}</span>
            {a.lastActivity && (
              <span className="alert-time">
                最后活动: {new Date(a.lastActivity).toLocaleTimeString('zh-CN')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
