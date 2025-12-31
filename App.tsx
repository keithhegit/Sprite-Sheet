import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import GeneratorPage from './components/GeneratorPage';
import HistoryPage from './components/history/HistoryPage';
import SettingsPage from './components/settings/SettingsPage';
import LoginPage from './components/auth/LoginPage';
import { useUserStore } from './stores/userStore';

// 内部组件，用于条件渲染 Header
const AppContent: React.FC = () => {
  const location = useLocation();
  // 使用选择器只订阅 fetchUser 和 initialized
  const fetchUser = useUserStore((state) => state.fetchUser);
  const initialized = useUserStore((state) => state.initialized);
  
  // 登录页不显示 Header
  const hideHeader = location.pathname === '/login';

  // 已移除：在 index.tsx 中全局初始化用户状态，避免组件重绘导致死循环
  // useEffect(() => { ... }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pb-20">
      {!hideHeader && <Header />}
      
      <Routes>
        <Route path="/" element={<GeneratorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
