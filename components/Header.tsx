import React from 'react';
import { Globe } from 'lucide-react';
import UserAvatar from './auth/UserAvatar';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center">
        <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img 
            src="https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/page%E4%B8%93%E7%94%A8/ogsprite/og_sprite_sheet_banner.png" 
            alt="OgSprite Logo" 
            className="h-16 w-auto object-contain"
          />
        </a>
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
