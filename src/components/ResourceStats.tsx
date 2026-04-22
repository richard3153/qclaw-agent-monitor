// 资源使用统计组件

import './ResourceStats.css';

interface ResourceStatsProps {
  resources: {
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
}

export function ResourceStats({ resources }: ResourceStatsProps) {
  const fmt = (n: number) => n.toLocaleString('zh-CN');
  const fmtCost = (n: number) => `$${n.toFixed(4)}`;
  
  return (
    <div className="resource-stats">
      <div className="stats-primary">
        <div className="stat-block">
          <div className="stat-big-value">{fmt(resources.totalTokens)}</div>
          <div className="stat-big-label">总消耗 Tokens</div>
        </div>
        <div className="stat-block">
          <div className="stat-big-value">{fmtCost(resources.estimatedCost)}</div>
          <div className="stat-big-label">估算费用</div>
        </div>
        <div className="stat-block">
          <div className="stat-big-value">{resources.messageCount}</div>
          <div className="stat-big-label">消息数</div>
        </div>
      </div>
      
      <div className="stats-secondary">
        <div className="stat-row">
          <span className="stat-label">📥 Input</span>
          <span className="stat-value">{fmt(resources.inputTokens)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">📤 Output</span>
          <span className="stat-value">{fmt(resources.outputTokens)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">📖 Cache Read</span>
          <span className="stat-value">{fmt(resources.cacheReadTokens)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">✏️ Cache Write</span>
          <span className="stat-value">{fmt(resources.cacheWriteTokens)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">💻 CPU</span>
          <span className="stat-value">{resources.cpu}%</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">💾 Memory</span>
          <span className="stat-value">{resources.memory} MB</span>
        </div>
      </div>
    </div>
  );
}
