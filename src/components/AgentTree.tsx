// 智能体树形展示组件

import { useAgentStore } from '../store/agentStore';
import { AgentNode } from './AgentNode';
import './AgentTree.css';

export function AgentTree() {
  const { agents, loading, error, lastRefresh, stuckAgents } = useAgentStore();
  const tree = useAgentStore(state => state.buildTree());
  
  if (error) {
    return (
      <div className="agent-tree-error">
        <span className="error-icon">❌</span>
        <span className="error-message">{error}</span>
      </div>
    );
  }
  
  if (agents.length === 0 && !loading) {
    return (
      <div className="agent-tree-empty">
        <span className="empty-icon">🤖</span>
        <span className="empty-message">暂无智能体运行</span>
      </div>
    );
  }
  
  return (
    <div className="agent-tree">
      {stuckAgents.size > 0 && (
        <div className="tree-alert">
          ⚠️ {stuckAgents.size} 个智能体卡住，需要干预
        </div>
      )}
      
      <div className="tree-header">
        <span className="tree-count">
          共 {agents.length} 个智能体
        </span>
        {loading && <span className="tree-loading">刷新中...</span>}
        {lastRefresh > 0 && (
          <span className="tree-last-refresh">
            最后更新: {new Date(lastRefresh).toLocaleTimeString('zh-CN')}
          </span>
        )}
      </div>
      
      <div className="tree-content">
        {tree.map(agent => (
          <AgentNode key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}