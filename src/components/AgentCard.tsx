// 智能体卡片组件

import { useState } from 'react';
import { Agent } from '../types/agent';
import { StatusBadge } from './StatusBadge';
import { ResourceStats } from './ResourceStats';
import './AgentCard.css';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isStuck = agent.status === 'stuck';
  const isActive = agent.status === 'running';
  
  const lastActiveText = agent.lastActivity
    ? new Date(agent.lastActivity).toLocaleString('zh-CN')
    : '无记录';
  
  const idleMinutes = agent.lastActivity
    ? Math.floor((Date.now() - agent.lastActivity) / 60000)
    : null;

  return (
    <div className={`agent-card ${isStuck ? 'agent-stuck' : ''} ${isActive ? 'agent-active' : ''}`}>
      <div className="card-main" onClick={() => setExpanded(!expanded)}>
        <div className="card-left">
          <span className="agent-emoji">{isStuck ? '🔴' : isActive ? '🟢' : '⚫'}</span>
          <div className="card-info">
            <div className="card-name">
              {agent.id === 'main' ? '🏠' : '🤖'} {agent.name}
              <span className="card-id">{agent.id}</span>
            </div>
            <div className="card-meta">
              <StatusBadge status={agent.status} />
              <span className="card-time">{lastActiveText}</span>
              {idleMinutes !== null && isActive && (
                <span className={`card-idle ${idleMinutes > 10 ? 'idle-warning' : ''}`}>
                  空闲 {idleMinutes} 分钟
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-mid">
          <span className="card-tokens">
            {agent.resourceUsage.totalTokens.toLocaleString('zh-CN')}
            <span className="tokens-unit"> tokens</span>
          </span>
        </div>
        
        <div className="card-right">
          <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>▶</span>
        </div>
      </div>
      
      {expanded && (
        <div className="card-detail">
          <div className="detail-section">
            <h4>📊 实时资源使用</h4>
            <ResourceStats resources={agent.resourceUsage} />
          </div>
          
          <div className="detail-section">
            <h4>📋 会话信息</h4>
            <div className="detail-row">
              <span className="detail-label">总会话数</span>
              <span className="detail-value">{agent.sessionInfo.totalSessions}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">活跃会话</span>
              <span className="detail-value">{agent.sessionInfo.activeSessions}</span>
            </div>
            {agent.sessionInfo.sessions?.map((s, i) => (
              <div key={s.id || i} className="detail-row">
                <span className="detail-label">{s.model}</span>
                <span className="detail-value">{s.totalTokens.toLocaleString()} tokens</span>
              </div>
            ))}
          </div>
          
          {agent.subAgentTasks?.length > 0 && (
            <div className="detail-section">
              <h4>🧩 子智能体任务 ({agent.subAgentTasks.length})</h4>
              {agent.subAgentTasks.map((task, i) => (
                <div key={i} className="detail-row">
                  <span className="detail-label">⚡ {task.name}</span>
                  <span className="detail-value task-running">{task.status}</span>
                </div>
              ))}
            </div>
          )}
          
          {agent.skills.length > 0 && (
            <div className="detail-section">
              <h4>🧩 已加载技能 ({agent.skills.length})</h4>
              <div className="skills-grid">
                {agent.skills.map(s => (
                  <span key={s} className="skill-tag">{s}</span>
                ))}
              </div>
            </div>
          )}
          
          {isStuck && (
            <div className="card-actions">
              <button className="action-btn continue-btn">▶️ 继续任务</button>
              <button className="action-btn resume-btn">🔄 恢复</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
