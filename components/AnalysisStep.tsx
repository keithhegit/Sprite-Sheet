import React from 'react';
import { ACTION_OPTIONS, ACTION_PRESETS, CUSTOM_ACTION_ID } from '../constants';
import {
  Sparkles,
  RefreshCw,
  Wand2,
  Rabbit,
  Footprints,
  Hourglass,
  Swords,
  ArrowUp,
  Skull,
  Shield,
} from 'lucide-react';

interface AnalysisStepProps {
  uploadedImage: string;
  selectedActions: string[];
  onToggleAction: (actionId: string) => void;
  onApplyPreset: (actionIds: string[]) => void;
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onReset: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Rabbit: <Rabbit size={20} />,
  Footprints: <Footprints size={20} />,
  Hourglass: <Hourglass size={20} />,
  Swords: <Swords size={20} />,
  ArrowUp: <ArrowUp size={20} />,
  Skull: <Skull size={20} />,
  Shield: <Shield size={20} />,
  Sparkles: <Sparkles size={20} />,
};

const AnalysisStep: React.FC<AnalysisStepProps> = ({
  uploadedImage,
  selectedActions,
  onToggleAction,
  onApplyPreset,
  customPrompt,
  onCustomPromptChange,
  onGenerate,
  isGenerating,
  onReset,
}) => {
  const canGenerate =
    selectedActions.length > 0 &&
    (!selectedActions.includes(CUSTOM_ACTION_ID) || (selectedActions.includes(CUSTOM_ACTION_ID) && customPrompt.trim().length > 0));

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full h-full p-2">
      <div className="flex-1 flex flex-col gap-4">
        <div className="relative aspect-square w-full rounded-2xl border border-gray-200 overflow-hidden checkerboard flex items-center justify-center group">
          <img
            src={uploadedImage}
            alt="Uploaded Character"
            className="max-w-[80%] max-h-[80%] object-contain drop-shadow-lg"
          />

          <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            参考图
          </div>
          <button
            onClick={onReset}
            className="absolute top-4 right-4 bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-full shadow-sm hover:bg-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={12} />
            更换图片
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-yellow-100 p-1 rounded">
              <Wand2 className="text-yellow-600" size={16} />
            </div>
            <h4 className="text-sm font-bold text-gray-800">直接模式</h4>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            跳过文本分析，AI 将直接查看你上传的图片来生成精灵图。
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800">选择动作（可多选）</h3>
            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded font-medium">步骤 2</span>
          </div>
          <span className="text-xs font-bold text-gray-400">
            已选择 <span className="text-brand-accent">{selectedActions.length}</span> 个动作
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {ACTION_OPTIONS.map((option) => {
            const isSelected = selectedActions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => onToggleAction(option.id)}
                className={`
                  flex items-center gap-3 p-4 rounded-xl border text-left transition-all btn-bounce
                  ${
                    isSelected
                      ? 'border-brand-accent bg-brand-accent/5 shadow-sm ring-1 ring-brand-accent/50'
                      : 'border-gray-200 bg-white hover:border-brand-accent/30 hover:bg-gray-50'
                  }
                `}
              >
                <div className={isSelected ? 'text-brand-accent' : 'text-gray-400'}>
                  {iconMap[option.icon] ?? <Sparkles size={20} />}
                </div>
                <div>
                  <div className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{option.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{option.subLabel}</div>
                </div>
              </button>
            );
          })}
        </div>

        <textarea
          className={`w-full p-4 rounded-xl border bg-white resize-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 mb-4 transition-all ${
            selectedActions.includes(CUSTOM_ACTION_ID) ? 'border-brand-accent' : 'border-gray-200 opacity-60'
          }`}
          rows={3}
          disabled={!selectedActions.includes(CUSTOM_ACTION_ID)}
          placeholder="描述你的自定义动画（例如：‘后空翻’、‘喝药水’）..."
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {ACTION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset.actions)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10 transition-all btn-bounce"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => onApplyPreset([])}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all btn-bounce"
          >
            清空
          </button>
        </div>

        <div className="mt-auto space-y-4">
          <button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating}
            className="w-full py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-xl shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/30 transition-all flex items-center justify-center gap-2 group btn-bounce disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Sparkles className="animate-spin" size={18} />
                正在生成...
              </>
            ) : (
              <>
                <Wand2 size={18} className="text-white animate-pulse" />
                <span>开始生成</span>
                <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded ml-2">支持多动作</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisStep;