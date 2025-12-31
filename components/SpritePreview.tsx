import React from 'react';
import SpritePlayer from './SpritePlayer';

interface SpritePreviewProps {
  imageUrl: string;
  activeFrames: boolean[];
  fps: number;
  isPlaying: boolean;
  isTransparent: boolean;
}

const SpritePreview: React.FC<SpritePreviewProps> = ({
  imageUrl,
  activeFrames,
  fps,
  isPlaying,
  isTransparent,
}) => {
  return (
    <div className="relative w-full h-72 bg-[#2D2D2D] rounded-[40px] shadow-2xl p-4 ring-4 ring-gray-100 ring-opacity-50 flex items-center justify-center">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-gray-600 rounded-b-full z-20 opacity-50" />
      <div
        className={`w-full h-full rounded-[32px] overflow-hidden relative ${
          isTransparent ? 'bg-white' : 'bg-green-600'
        } transition-colors flex items-center justify-center`}
      >
        <SpritePlayer
          imageUrl={imageUrl}
          fps={fps}
          isPlaying={isPlaying}
          transparentBg={isTransparent}
          activeFrames={activeFrames}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-48 h-4 bg-black/20 blur-xl rounded-full" />
    </div>
  );
};

export default SpritePreview;

