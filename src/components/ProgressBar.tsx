// 进度条组件

import './ProgressBar.css';

interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
}

export function ProgressBar({ current, total, showText = true }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <span className="progress-text">
          {current}/{total} ({percentage}%)
        </span>
      )}
    </div>
  );
}

// 预计剩余时间格式化
export function formatTimeRemaining(seconds: number | undefined): string {
  if (seconds === undefined || seconds <= 0) return '--';
  
  if (seconds < 60) {
    return `~${seconds}秒`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `~${minutes}分${remainingSeconds}秒`
      : `~${minutes}分钟`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `~${hours}小时${remainingMinutes}分钟`;
}

interface TimeRemainingProps {
  seconds: number | undefined;
}

export function TimeRemaining({ seconds }: TimeRemainingProps) {
  return (
    <span className="time-remaining">
      剩余: {formatTimeRemaining(seconds)}
    </span>
  );
}