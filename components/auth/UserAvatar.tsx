import React, { useState, useRef, useEffect } from 'react';
import { History, Settings, LogOut, LogIn, Film } from 'lucide-react';
import { useUserStore } from '../../stores/userStore';
import { useNavigate } from 'react-router-dom';

const UserAvatar: React.FC = () => {
  // 使用选择器，只订阅需要的状态
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const logout = useUserStore((state) => state.logout);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />;
  }

  // 未登录状态
  if (!user) {
    return (
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-xl font-bold text-sm hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20"
      >
        <LogIn size={16} />
        登录 / 注册
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg hover:scale-105 transition-transform"
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.email} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-accent flex items-center justify-center text-white">
            <span className="font-bold text-lg">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* 用户信息 */}
          <div className="p-4 border-b border-gray-100">
            <p className="font-bold text-gray-800 truncate">{user.email}</p>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest">UID: {user.id}</p>
          </div>

          {/* 菜单项 */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate('/frame-preview');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Film size={18} className="text-gray-400" />
              序列帧预览
            </button>
            <button
              onClick={() => {
                navigate('/history');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <History size={18} className="text-gray-400" />
              历史记录
            </button>
            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings size={18} className="text-gray-400" />
              账号管理
            </button>
          </div>

          {/* 退出 */}
          <div className="border-t border-gray-100 py-2">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
