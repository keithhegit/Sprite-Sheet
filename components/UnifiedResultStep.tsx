import React, { useMemo, useState } from 'react';
import { Download, Film, Loader2, Pause, Play, RefreshCw } from 'lucide-react';
import FrameEditor from './FrameEditor';
import SpritePreview from './SpritePreview';
import { SpriteResult } from '../types';

// @ts-ignore
import GIFEncoderDefault, { GIFEncoder as NamedGIFEncoder, quantize, applyPalette } from 'gifenc';

const createGifEncoder = () => {
  const factory = typeof NamedGIFEncoder === 'function' ? NamedGIFEncoder : GIFEncoderDefault;
  if (typeof factory !== 'function') {
    throw new Error('GIFEncoder export is unavailable');
  }
  return factory();
};

interface UnifiedResultStepProps {
  results: SpriteResult[];
  activeResultId: string;
  onActiveResultChange: (actionId: string) => void;
  onFrameToggle: (actionId: string, frameIndex: number) => void;
  onRegenerate: (actionId: string) => void;
  regeneratingActionId: string | null;
  onReset: () => void;
}

const UnifiedResultStep: React.FC<UnifiedResultStepProps> = ({
  results,
  activeResultId,
  onActiveResultChange,
  onFrameToggle,
  onRegenerate,
  regeneratingActionId,
  onReset,
}) => {
  const [fps, setFps] = useState(8);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransparent, setIsTransparent] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const activeResult = useMemo(() => {
    if (!results.length) return null;
    return results.find((result) => result.actionId === activeResultId) ?? results[0];
  }, [results, activeResultId]);

  if (!activeResult) {
    return null;
  }

  const handleDownloadPng = (result: SpriteResult) => {
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `ogsprite-${result.actionId}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGif = async (result: SpriteResult) => {
    if (isExporting) return;
    if (!result.activeFrames.some(Boolean)) {
      alert('请至少保留一帧后再导出 GIF');
      return;
    }
    setIsExporting(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = result.imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(null);
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('无法创建 Canvas 上下文');

      const cols = 4;
      const rows = 4;
      const frameWidth = Math.floor(img.width / cols);
      const frameHeight = Math.floor(img.height / rows);
      canvas.width = frameWidth;
      canvas.height = frameHeight;

      const encoder = createGifEncoder();

      for (let i = 0; i < rows * cols; i++) {
        if (!result.activeFrames[i]) continue;

        const col = i % cols;
        const row = Math.floor(i / cols);

        ctx.clearRect(0, 0, frameWidth, frameHeight);

        if (!isTransparent) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, frameWidth, frameHeight);
        }

        ctx.drawImage(
          img,
          col * frameWidth,
          row * frameHeight,
          frameWidth,
          frameHeight,
          0,
          0,
          frameWidth,
          frameHeight
        );

        const imageData = ctx.getImageData(0, 0, frameWidth, frameHeight);
        const data = new Uint8Array(imageData.data);

        for (let j = 0; j < data.length; j += 4) {
          if (data[j + 3] < 128) {
            data[j] = 0;
            data[j + 1] = 0;
            data[j + 2] = 0;
            data[j + 3] = 0;
          } else {
            data[j + 3] = 255;
          }
        }

        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);

        encoder.writeFrame(index, frameWidth, frameHeight, {
          palette,
          delay: 1000 / fps,
          transparent: isTransparent ? -1 : undefined,
        });
      }

      encoder.finish();
      const buffer = encoder.bytes();
      const blob = new Blob([buffer], { type: 'image/gif' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ogsprite-${result.actionId}-${Date.now()}.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error(error);
      alert(`GIF 导出失败: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-1">Result</p>
          <h3 className="text-2xl font-bold text-gray-900">生成结果</h3>
          <p className="text-sm text-gray-500">可对每个动作独立屏蔽帧、导出 GIF 或重新生成</p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors btn-bounce"
        >
          <RefreshCw size={16} />
          重新上传
        </button>
      </div>

      {results.length > 1 && (
        <div className="flex flex-wrap gap-3">
          {results.map((result) => {
            const isActive = result.actionId === activeResult.actionId;
            const isRegenerating = regeneratingActionId === result.actionId;
            return (
              <button
                key={result.actionId}
                onClick={() => onActiveResultChange(result.actionId)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all border btn-bounce ${
                  isActive
                    ? 'bg-brand-accent text-white border-brand-accent shadow-brand-accent/30 shadow-lg'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-accent/40'
                }`}
              >
                {result.actionLabel}
                {isRegenerating && <Loader2 size={14} className="inline ml-2 animate-spin" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <FrameEditor
          imageUrl={activeResult.imageUrl}
          activeFrames={activeResult.activeFrames}
          onToggle={(index) => onFrameToggle(activeResult.actionId, index)}
        />

        <div className="flex-1 flex flex-col gap-4">
          <SpritePreview
            imageUrl={activeResult.imageUrl}
            activeFrames={activeResult.activeFrames}
            fps={fps}
            isPlaying={isPlaying}
            isTransparent={isTransparent}
          />

          <div className="w-full space-y-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setIsPlaying((prev) => !prev)}
                className="w-12 h-12 bg-brand-accent rounded-xl flex items-center justify-center text-white hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20 btn-bounce"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <div className="flex-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                  <span>播放速度</span>
                  <span className="bg-brand-accent/10 text-brand-accent px-1.5 rounded">{fps} FPS</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                />
              </div>
            </div>

            <div className="flex gap-2 text-xs font-bold p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setIsTransparent(false)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  !isTransparent ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                纯色底
              </button>
              <button
                onClick={() => setIsTransparent(true)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  isTransparent ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                透明底
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDownloadPng(activeResult)}
                className="w-full py-4 bg-white border-2 border-brand-accent text-brand-accent hover:bg-brand-accent/5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 btn-bounce"
              >
                <Download size={18} /> 下载精灵图 (PNG)
              </button>
              <button
                onClick={() => handleExportGif(activeResult)}
                disabled={isExporting}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-bounce"
              >
                {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Film size={18} />}
                {isExporting ? '正在导出 GIF...' : '导出动态图 (GIF)'}
              </button>
            </div>

            <button
              onClick={() => onRegenerate(activeResult.actionId)}
              disabled={regeneratingActionId === activeResult.actionId}
              className="w-full py-3 mt-2 bg-brand-accent text-white font-bold rounded-2xl shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed btn-bounce"
            >
              {regeneratingActionId === activeResult.actionId ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  正在重新生成...
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  重新生成该动作
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedResultStep;
