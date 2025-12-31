import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { useUserStore } from './stores/userStore';

// 应用启动时立即初始化用户状态
console.log('[Index] 初始化用户状态');
useUserStore.getState().fetchUser();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);