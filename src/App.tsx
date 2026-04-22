// 主应用组件

import { useEffect } from 'react';
import { useAgentStore } from './store/agentStore';
import { AgentList } from './components/AgentList';
import './App.css';

function App() {
  const { refresh, refreshInterval, loading } = useAgentStore();
  
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title">
          <span className="title-icon">🖥️</span>
          <h1>QClaw Agent Monitor</h1>
          <span className="title-badge">v1.0</span>
        </div>
        <button 
          className="refresh-btn"
          onClick={() => refresh()}
          disabled={loading}
        >
          {loading ? '🔄 刷新中...' : '🔄 刷新'}
        </button>
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
