// 状态徽章组件

import { AgentStatus } from '../types/agent';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: AgentStatus;
}

const STATUS_LABELS: Record<AgentStatus, string> = {
  running: '运行中',
  waiting: '等待中',
  stuck: '卡住!',
  completed: '已完成',
  failed: '失败',
  unknown: '未知',
};

const STATUS_EMOJIS: Record<AgentStatus, string> = {
  running: '🟢',
  waiting: '🟡',
  stuck: '🔴',
  completed: '🔵',
  failed: '⚫',
  unknown: '⚪',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-emoji">{STATUS_EMOJIS[status]}</span>
      <span className="status-label">{STATUS_LABELS[status]}</span>
    </span>
  );
}
