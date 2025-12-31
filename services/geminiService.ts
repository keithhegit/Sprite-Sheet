import { GenerationConfig, GeneratedResult } from "../types";

// ==================================================================================
// 1. Gemini API 逻辑已移至后端以保护 API KEY
// ==================================================================================

const API_BASE_URL = '/api/ai';

export const getStoredApiKey = (): string | null => {
  return null; // 不再需要本地存储 API Key
};

export const setStoredApiKey = (key: string): void => {
  // 不再需要本地设置 API Key
};

export const clearStoredApiKey = (): void => {
  // 不再需要清除本地 API Key
};

export const testConnection = async (): Promise<string> => {
  return "Connected to Backend (Proxy)";
};

export const generateSpriteSheet = async (config: GenerationConfig): Promise<GeneratedResult> => {
  const token = localStorage.getItem('ogsprite_auth_token');
  
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      image: config.image,
      action: config.action,
      customPrompt: config.customPrompt
    })
  });

  if (!response.ok) {
    const error = await response.json() as { error?: string };
    throw new Error(error.error || '生成失败，请检查后端配置或重试');
  }

  const data = await response.json() as { imageUrl: string, promptUsed: string };
  return {
    imageUrl: data.imageUrl,
    promptUsed: data.promptUsed
  };
};
