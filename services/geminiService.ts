import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, GeneratedResult } from "../types";

// ==================================================================================
// 1. API KEY 配置 - 从 localStorage 读取（最可靠的浏览器端方案）
// ==================================================================================
const API_KEY_STORAGE_KEY = 'ogsprite_gemini_api_key';
const API_KEY_STORAGE_KEY_LEGACY = 'ogspirit_gemini_api_key';
const ENV_API_KEY = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;

export const getStoredApiKey = (): string | null => {
  const key = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (key) return key;
  const legacy = localStorage.getItem(API_KEY_STORAGE_KEY_LEGACY);
  if (legacy) {
    localStorage.setItem(API_KEY_STORAGE_KEY, legacy);
    localStorage.removeItem(API_KEY_STORAGE_KEY_LEGACY);
    return legacy;
  }
  return null;
};

export const setStoredApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const clearStoredApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(API_KEY_STORAGE_KEY_LEGACY);
};

// 支持图片生成的模型
const GEMINI_MODEL = 'gemini-3-pro-image-preview';

const resolveApiKey = (): string | null => {
  const storedKey = getStoredApiKey();
  if (storedKey && storedKey.trim() !== '') {
    return storedKey;
  }
  return ENV_API_KEY && ENV_API_KEY.trim() !== '' ? ENV_API_KEY : null;
};

const getClient = () => {
  // 第一步读取用户在页面输入的 Key，确保本地开发体验一致
  const apiKey = resolveApiKey();
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("请先在页面顶部设置你的 Gemini API Key！");
  }

  // 不指定 apiVersion，让 SDK 自动选择正确的版本
  return new GoogleGenAI({ apiKey });
};

export const testConnection = async (): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: 'Reply with "OK" if connected.',
    });
    return response.text || "Connected (No text returned)";
  } catch (error: any) {
    console.error("Connection Test Error:", error);
    throw error;
  }
};

export const generateSpriteSheet = async (config: GenerationConfig): Promise<GeneratedResult> => {
  const ai = getClient();

  const base64Data = config.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  const actionMap: Record<string, string> = {
    'run': 'running cycle. Body leans forward slightly. Legs (if exist) move dynamically. If floating, body bobs forward.',
    'walk': 'walking cycle. Gentle movement. strictly facing right.',
    'idle': 'idle breathing. Minimal movement. Chest expands/contracts. Strictly facing right.',
    'attack': 'Melee attack animation. SWING the weapon/body part forward. DO NOT throw the object. Keep hold of the weapon at all times. Frames 1-4: Wind up back. Frames 5-8: Swing forward. Frames 9-12: Impact pose. Frames 13-16: Return to start.',
    'hit': 'taking damage / hit reaction. Character recoils after being struck, slight knockback, spark impact. Maintain facing right.',
    'jump': 'Vertical jump. Frames 1-4: Anticipation (Squash). Frames 5-8: Upward movement. Frames 9-12: Apex/Hover. Frames 13-16: Landing (Stretch/Squash).',
    'die': 'Death animation. Character collapses or dissolves on the spot.',
    'custom': config.customPrompt || 'performing an action'
  };

  const actionDescription = config.action === 'custom'
    ? (config.customPrompt || 'performing an action')
    : (actionMap[config.action] || config.action);

  const prompt = `
    You are a strictly disciplined Pixel Art Engine. Generate a 4x4 Sprite Sheet (16 frames).

    INPUT IMAGE IS THE ABSOLUTE TRUTH.
    
    ACTION: ${actionDescription}
    
    [MODULE 1: VISUAL FIDELITY & ANATOMY] (CRITICAL)
    1. **NO HALLUCINATION**: Look at the input image. 
       - If the character has NO FEET (floating/ghost), DO NOT DRAW FEET.
       - If the character has NO LEGS, DO NOT ADD LEGS.
    2. **OBJECT PERMANENCE**: 
       - If the character is holding a staff/weapon, the item is GLUED to their hand. 
       - DO NOT THROW the weapon unless explicitly told.
       - If there is a ball on a staff, it stays ON THE STAFF. Do not detach it.
    3. **STYLE MATCH**: Exact color palette, exact shading style, exact proportions as the input.
    4. **RIGID TEXTURE LOCK**: The held object (Book, Staff, Sword) is a SOLID RIGID BODY. It must NOT morph, squash, stretch, or change size between frames. The pixels of the weapon must remain consistent.

    [MODULE 2: SPATIAL STABILITY & GRID] (CRITICAL TO FIX JITTER)
    1. **ABSOLUTE ALIGNMENT**: Imagine an X/Y coordinate system in every one of the 16 grid cells.
       - The character's **CENTER OF MASS (Torso)** must be at the EXACT SAME Coordinate (e.g., X=50%, Y=60%) in ALL 16 cells.
       - **DO NOT DRIFT**: Row 4 (Frames 13-16) must be vertically aligned exactly with Row 1.
    2. **SCALE**: Character size must be 50-60% of the grid cell. Keep strictly centered.
    3. **PADDING**: Ensure ample white space around the character in every cell.

    [MODULE 3: ANIMATION RULES]
    1. **DIRECTION**: Strictly face RIGHT. No turning around.
    2. **LOOP**: Frame 16 must transition smoothly back to Frame 1.
    3. **GRID**: 4x4 format. NO visible grid lines. Solid White Background.
    4. **SEQUENCE**: Must be a single continuous 16-frame action (Z-pattern). Motion must be chronologically silky smooth.

    Generate the sprite sheet now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data,
            },
          },
        ],
      },
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });
    
    // Parse Response - search for image data in parts
    let generatedImageBase64 = '';
    
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          generatedImageBase64 = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      throw new Error("未能从 Gemini 获取到图片数据。请确保使用了支持多模态生成的 API Key。");
    }

    return {
      imageUrl: generatedImageBase64,
      promptUsed: prompt
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
