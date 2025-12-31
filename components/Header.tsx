import React from 'react';
import { Globe } from 'lucide-react';
import UserAvatar from './auth/UserAvatar';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Logo icon simulation */}
          <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white font-bold relative shadow-lg shadow-brand-accent/20">
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-cream"></span>
            <span className="transform -rotate-12 text-xl">🔥</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">OgSprite</h1>
        </div>
        
        <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50">
          <Globe size={14} />
          <span>中文</span>
        </button>
      </div>
      
      <div className="absolute left-1/2 transform -translate-x-1/2 mt-12 hidden md:block text-gray-400 text-sm">
        一键生成精灵图
      </div>

      <div className="flex items-center gap-3">
        {/* 用户头像 */}
        <UserAvatar />
      </div>
    </header>
  );
};

export default Header;
