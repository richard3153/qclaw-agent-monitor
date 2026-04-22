// 智能体节点组件

import { useState } from 'react';
import { AgentTreeNode } from '../types/agent';
import { StatusBadge } from './StatusBadge';
import { ProgressBar, TimeRemaining } from './ProgressBar';
import { ResourceStats } from './ResourceStats';
import { useAgentStore } from '../store/agentStore';
import './AgentNode.css';

interface AgentNodeProps {
  agent: AgentTreeNode;
  depth?: number;
}

export function AgentNode({ agent, depth = 0 }: AgentNodeProps) {
  const [isResuming, setIsResuming] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  
  const { resume, cont, stuckAgents } = useAgentStore();
  const isStuck = stuckAgents.has(agent.id);
  
  const hasChildren = agent.children && agent.children.length > 0;
  const isExpanded = agent.expanded;
  
  const handleResume = async () => {
    setIsResuming(true);
    await resume(agent.id);
    setIsResuming(false);
  };
  
  const handleContinue = async () => {
    setIsContinuing(true);
    await cont(agent.id);
    setIsContinuing(false);
  };
  
  return (
    <div className={`agent-node ${isStuck ? 'agent-stuck' : ''}`} style={{ marginLeft: depth * 20 }}>
      <div className="agent-header">
        <div className="agent-icon">
          {hasChildren ? (isExpanded ? '📂' : '📁') : '📦'}
        </div>
        <div className="agent-info">
          <div className="agent-name">
            <span className="agent-label">🧠</span>
            {agent.name}
            <span className="agent-id">({agent.id})</span>
          </div>
          
          <div className="agent-status-row">
            <StatusBadge status={isStuck ? 'stuck' : agent.status} />
            
            {agent.progress && (
              <>
                <ProgressBar 
                  current={agent.progress.current} 
                  total={agent.progress.total} 
                />
                <TimeRemaining seconds={agent.estimatedTimeRemaining} />
              </>
            )}
          </div>
          
          <ResourceStats resources={agent.resourceUsage} />
          
          {isStuck && (
            <div className="agent-actions">
              <button 
                className="action-btn continue-btn"
                onClick={handleContinue}
                disabled={isContinuing}
              >
                {isContinuing ? '处理中...' : '继续任务'}
              </button>
              <button 
                className="action-btn resume-btn"
                onClick={handleResume}
                disabled={isResuming}
              >
                {isResuming ? '处理中...' : '恢复'}
              </button>
            </div>
          )}
          
          {agent.error && (
            <div className="agent-error">
              错误: {agent.error}
            </div>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div className="agent-children">
          {agent.children.map(child => (
            <AgentNode key={child.id} agent={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}