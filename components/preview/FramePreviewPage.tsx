import React, { useRef, useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Stepper from '../Stepper';
import UnifiedResultStep from '../UnifiedResultStep';
import { AppStep, SpriteResult } from '../../types';

const FramePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [result, setResult] = useState<SpriteResult | null>(null);
  const [activeResultId, setActiveResultId] = useState('preview');
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setCurrentStep(AppStep.UPLOAD);
    setResult(null);
    setActiveResultId('preview');
    setError(null);
  };

  const handleImageSelect = (base64: string) => {
    setError(null);
    setResult({
      actionId: 'preview',
      actionLabel: '预览',
      imageUrl: base64,
      promptUsed: '',
      activeFrames: Array(16).fill(true),
      generatedAt: Date.now(),
    });
    setCurrentStep(AppStep.RESULT);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl.startsWith('data:image/')) {
        setError('请选择图片文件（PNG/JPG/GIF/WebP）');
        return;
      }
      handleImageSelect(dataUrl);
    };
    reader.onerror = () => setError('读取图片失败，请重试');
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => handleImageSelect(String(reader.result || ''));
    reader.onerror = () => setError('读取图片失败，请重试');
    reader.readAsDataURL(file);
  };

  const handleFrameToggle = (_actionId: string, frameIndex: number) => {
    setResult((prev) => {
      if (!prev) return prev;
      const frames = [...prev.activeFrames];
      frames[frameIndex] = !frames[frameIndex];
      if (!frames.some(Boolean)) {
        frames[frameIndex] = true;
      }
      return { ...prev, activeFrames: frames };
    });
  };

  return (
    <div className="min-h-screen bg-brand-cream py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all btn-bounce"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">序列帧预览</h1>
            <p className="text-sm text-gray-500">上传精灵图，预览动画并导出 PNG / GIF</p>
          </div>
        </div>

        <main className="w-full px-0 flex flex-col items-center">
          <div className="bg-white w-full rounded-[40px] card-elevated p-8 md:p-12 min-h-[600px] flex flex-col items-center transition-all duration-500">
            <Stepper currentStep={currentStep} />

            <div className="w-full flex-1 flex flex-col">
              {error && (
                <div className="mb-4 w-full bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm border border-red-100 break-words">
                  <p className="font-bold">Error:</p>
                  {error}
                </div>
              )}

              {currentStep === AppStep.UPLOAD && (
                <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div
                    className="
                      w-full max-w-lg h-80
                      border-2 border-dashed border-gray-200 rounded-[32px]
                      bg-brand-cream hover:border-brand-accent/30 hover:bg-white
                      flex flex-col items-center justify-center
                      transition-all cursor-pointer group
                      relative overflow-hidden shadow-sm hover:shadow-md
                    "
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-16 h-16 mb-6 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 group-hover:shadow-brand-accent/20 transition-all duration-300">
                        <Upload className="text-brand-accent" size={32} />
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-2">上传精灵图</h3>
                      <p className="text-gray-500 text-sm mb-1">拖拽图片到这里，或点击上传</p>
                      <p className="text-gray-400 text-xs">支持 PNG, JPG, GIF, WebP</p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}

              {currentStep === AppStep.RESULT && result && (
                <UnifiedResultStep
                  results={[result]}
                  activeResultId={activeResultId}
                  onActiveResultChange={setActiveResultId}
                  onFrameToggle={handleFrameToggle}
                  onRegenerate={() => {}}
                  regeneratingActionId={null}
                  onReset={handleReset}
                  showRegenerate={false}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FramePreviewPage;

