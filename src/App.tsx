// 主应用组件

import { useEffect, useRef } from 'react';
import { useAgentStore } from './store/agentStore';
import { AgentList } from './components/AgentList';
import './App.css';

function App() {
  const { refresh, loading, autoRefresh, setAutoRefresh, refreshInterval } = useAgentStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 手动刷新（会触发一次加载）
  const handleManualRefresh = async () => {
    await refresh();
  };

  // 自动刷新控制
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoRefresh) {
      refresh(); // 立即刷新一次
      intervalRef.current = setInterval(refresh, refreshInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="title-icon">🖥️</span>
          <h1>QClaw Agent Monitor</h1>
          <span className="title-badge">v1.0</span>
        </div>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={handleManualRefresh}
            disabled={loading}
            title="手动刷新一次"
          >
            {loading ? '🔄' : '🔄'} 刷新
          </button>
          <button
            className={`pause-btn ${autoRefresh ? 'paused' : 'resumed'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? '暂停自动刷新' : '恢复自动刷新'}
          >
            {autoRefresh ? '⏸ 暂停' : '▶ 继续'}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <AgentList />
      </main>
      
      <footer className="app-footer">
        QClaw 智能体监控面板 · 数据来自本地 OpenClaw Gateway
      </footer>
    </div>
  );
}

export default App;
