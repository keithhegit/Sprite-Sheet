import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import GeneratorPage from './components/GeneratorPage';
import HistoryPage from './components/history/HistoryPage';
import SettingsPage from './components/settings/SettingsPage';
import LoginPage from './components/auth/LoginPage';
import FramePreviewPage from './components/preview/FramePreviewPage';
import { useUserStore } from './stores/userStore';

// 路由保护组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const initialized = useUserStore((state) => state.initialized);
  const loading = useUserStore((state) => state.loading);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const initialized = useUserStore((state) => state.initialized);
  
  useEffect(() => {
    if (!initialized) {
      fetchUser();
    }
  }, [initialized, fetchUser]);

  const hideHeader = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col items-center pb-20">
      {!hideHeader && <Header />}
      
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <GeneratorPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/frame-preview"
          element={
            <ProtectedRoute>
              <FramePreviewPage />
            </ProtectedRoute>
          }
        />
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
