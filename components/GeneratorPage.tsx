import React, { useMemo, useState, useEffect } from 'react';
import Stepper from './Stepper';
import UploadStep from './UploadStep';
import AnalysisStep from './AnalysisStep';
import LoadingStep from './LoadingStep';
import UnifiedResultStep from './UnifiedResultStep';
import { ACTION_OPTIONS, CUSTOM_ACTION_ID } from '../constants';
import { AppStep, SpriteResult } from '../types';
import { generateSpriteSheet } from '../services/geminiService';
import { useUserStore } from '../stores/userStore';
import { uploadService } from '../services/uploadService';
import { historyService } from '../services/historyService';

const GeneratorPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [selectedActions, setSelectedActions] = useState<string[]>(['run']);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [results, setResults] = useState<SpriteResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingActionId, setRegeneratingActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 使用选择器，只订阅 user 状态
  const user = useUserStore((state) => state.user);

  const handleImageSelect = (base64: string) => {
    setUploadedImage(base64);
    setCurrentStep(AppStep.ANALYSIS);
  };

  const handleReset = () => {
    setUploadedImage('');
    setResults([]);
    setSelectedActions(['run']);
    setCustomPrompt('');
    setActiveResultId('');
    setIsGenerating(false);
    setRegeneratingActionId(null);
    setCurrentStep(AppStep.UPLOAD);
    setError(null);
  };

  const handleToggleAction = (actionId: string) => {
    setSelectedActions((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((id) => id !== actionId);
      }
      return [...prev, actionId];
    });
  };

  const handleApplyPreset = (actionIds: string[]) => {
    setSelectedActions(actionIds);
  };

  const buildActionLabel = (actionId: string) => {
    return ACTION_OPTIONS.find((option) => option.id === actionId)?.label || '自定义';
  };

  const buildGenerationPayload = (actionId: string) => {
    const option = ACTION_OPTIONS.find((item) => item.id === actionId);
    const generationAction = option?.generationAction || actionId;
    let promptOverride: string | undefined;

    if (generationAction === 'custom') {
      if (actionId === CUSTOM_ACTION_ID) {
        promptOverride = customPrompt.trim();
      } else if (option?.customPrompt) {
        promptOverride = option.customPrompt;
      }
    }

    return {
      action: generationAction,
      customPrompt: promptOverride,
    };
  };

  const createResultFromResponse = (actionId: string, imageUrl: string, promptUsed: string): SpriteResult => ({
    actionId,
    actionLabel: buildActionLabel(actionId),
    imageUrl,
    promptUsed,
    activeFrames: Array(16).fill(true),
    generatedAt: Date.now(),
  });

  // 保存历史记录到服务器
  const saveToHistory = async (originalImage: string, spriteResults: SpriteResult[]) => {
    if (!user) {
      console.log('User not logged in, skipping history save');
      return;
    }

    try {
      console.log('Saving to history...');
      
      // 1. 上传原始图片
      const originalKey = await uploadService.uploadOriginal(originalImage);
      
      // 2. 批量上传精灵图
      const historyId = crypto.randomUUID().slice(0, 8);
      const uploadResults = await uploadService.uploadSpritesBatch(
        historyId,
        spriteResults.map((r) => ({
          image: r.imageUrl,
          actionId: r.actionId,
        }))
      );

      // 3. 创建历史记录
      await historyService.createHistory({
        originalImageKey: originalKey,
        sprites: uploadResults.map((uploadResult) => {
          const result = spriteResults.find((r) => r.actionId === uploadResult.actionId)!;
          return {
            actionId: result.actionId,
            actionLabel: result.actionLabel,
            spriteImageKey: uploadResult.key,
            promptUsed: result.promptUsed,
          };
        }),
      });

      console.log('History saved successfully');
    } catch (error) {
      console.error('Failed to save history:', error);
      // 不阻断用户操作，只是记录错误
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('请先上传角色图片。');
      return;
    }
    if (selectedActions.length === 0) {
      setError('至少选择一个动作。');
      return;
    }
    if (selectedActions.includes(CUSTOM_ACTION_ID) && customPrompt.trim().length === 0) {
      setError('请填写自定义动作描述。');
      return;
    }

    setIsGenerating(true);
    setResults([]);
    setActiveResultId('');
    setCurrentStep(AppStep.GENERATION);
    setError(null);

    try {
      const tasks = selectedActions.map(async (actionId) => {
        const payload = buildGenerationPayload(actionId);
        const sprite = await generateSpriteSheet({
          image: uploadedImage,
          action: payload.action,
          customPrompt: payload.customPrompt,
        });
        return createResultFromResponse(actionId, sprite.imageUrl, sprite.promptUsed);
      });

      const generated = await Promise.all(tasks);
      setResults(generated);
      setActiveResultId(generated[0]?.actionId ?? '');
      setCurrentStep(AppStep.RESULT);

      // 生成成功后保存历史记录（异步，不阻塞）
      saveToHistory(uploadedImage, generated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '生成失败，请检查 API Key 或稍后重试。');
      setCurrentStep(AppStep.ANALYSIS);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (actionId: string) => {
    if (!uploadedImage) {
      setError('请先上传角色图片后再重新生成该动作。');
      return;
    }

    setRegeneratingActionId(actionId);
    setError(null);

    try {
      const payload = buildGenerationPayload(actionId);
      const sprite = await generateSpriteSheet({
        image: uploadedImage,
        action: payload.action,
        customPrompt: payload.customPrompt,
      });
      setResults((prev) =>
        prev.map((item) =>
          item.actionId === actionId ? createResultFromResponse(actionId, sprite.imageUrl, sprite.promptUsed) : item
        )
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || '动作重新生成失败，请稍后再试。');
    } finally {
      setRegeneratingActionId(null);
    }
  };

  const handleFrameToggle = (actionId: string, frameIndex: number) => {
    setResults((prev) =>
      prev.map((item) => {
        if (item.actionId !== actionId) return item;
        const frames = [...item.activeFrames];
        frames[frameIndex] = !frames[frameIndex];
        if (!frames.some(Boolean)) {
          // 至少保留一帧，若全部关闭则恢复当前帧
          frames[frameIndex] = true;
        }
        return { ...item, activeFrames: frames };
      })
    );
  };

  const loadingMessage = useMemo(() => {
    if (!selectedActions.length) return undefined;
    return `正在生成 ${selectedActions.length} 个动作，请稍候...`;
  }, [selectedActions.length]);

  return (
    <main className="w-full max-w-5xl px-4 flex flex-col items-center">
      {/* Main Card */}
      <div className="bg-white w-full rounded-[40px] card-elevated p-8 md:p-12 min-h-[600px] flex flex-col items-center transition-all duration-500">
        <Stepper currentStep={currentStep} />

        {/* Content Area */}
        <div className="w-full flex-1 flex flex-col">
          {error && (
            <div className="mb-4 w-full bg-red-50 text-red-600 p-3 rounded-lg text-center text-sm border border-red-100 break-words">
              <p className="font-bold">Error:</p>
              {error}
            </div>
          )}

          {currentStep === AppStep.UPLOAD && <UploadStep onImageSelect={handleImageSelect} />}

          {currentStep === AppStep.ANALYSIS && (
            <AnalysisStep
              uploadedImage={uploadedImage}
              selectedActions={selectedActions}
              onToggleAction={handleToggleAction}
              onApplyPreset={handleApplyPreset}
              customPrompt={customPrompt}
              onCustomPromptChange={setCustomPrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              onReset={handleReset}
            />
          )}

          {currentStep === AppStep.GENERATION && (
            <LoadingStep uploadedImage={uploadedImage} message={loadingMessage} />
          )}

          {currentStep === AppStep.RESULT && (
            <UnifiedResultStep
              results={results}
              activeResultId={activeResultId}
              onActiveResultChange={setActiveResultId}
              onFrameToggle={handleFrameToggle}
              onRegenerate={handleRegenerate}
              regeneratingActionId={regeneratingActionId}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default GeneratorPage;


