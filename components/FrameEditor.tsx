import React from 'react';
import { EyeOff } from 'lucide-react';

interface FrameEditorProps {
  imageUrl: string;
  activeFrames: boolean[];
  onToggle: (index: number) => void;
}

const FrameEditor: React.FC<FrameEditorProps> = ({ imageUrl, activeFrames, onToggle }) => {
  const frames = Array.from({ length: 16 });

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="relative aspect-square w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <img
          src={imageUrl}
          alt="Sprite Sheet"
          className="absolute inset-0 w-full h-full object-contain pixelated pointer-events-none z-10"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 z-20">
          {frames.map((_, index) => {
            const isActive = activeFrames[index];
            return (
              <button
                key={index}
                type="button"
                onClick={() => onToggle(index)}
                className={`relative transition-all duration-200 border border-transparent ${
                  isActive
                    ? 'hover:bg-brand-accent/5 hover:border-brand-accent/30'
                    : 'bg-gray-900/60 backdrop-blur-[1px]'
                }`}
              >
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/80">
                    <EyeOff size={24} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 leading-relaxed">
        点击网格可屏蔽坏帧，所有相关功能（预览 / GIF 导出）都会同步忽略被屏蔽的帧。
      </div>
    </div>
  );
};

export default FrameEditor;

