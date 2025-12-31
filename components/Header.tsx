import React from 'react';
import UserAvatar from './auth/UserAvatar';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-4 px-4 max-w-5xl mx-auto w-full relative gap-6">
      <div className="flex items-center flex-1 min-w-0">
        <a href="/" className="flex items-center hover:opacity-90 transition-opacity w-full min-w-0">
          <img 
            src="https://pub-c98d5902eedf42f6a9765dfad981fd88.r2.dev/page%E4%B8%93%E7%94%A8/ogsprite/og_sprite_sheet_banner.png" 
            alt="OgSprite Logo" 
            className="h-20 w-auto max-w-full object-contain"
          />
        </a>
      </div>

      <div className="flex items-center gap-3">
        {/* 用户头像 */}
        <UserAvatar />
      </div>
    </header>
  );
};

export default Header;
