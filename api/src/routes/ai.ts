import { Hono } from 'hono';
import { GoogleGenAI } from "@google/genai";
import { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const ai = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// 所有 AI 相关接口都需要认证
ai.use('/*', authMiddleware);

const GEMINI_MODEL = 'gemini-3-pro-image-preview';

ai.post('/generate', async (c) => {
  const apiKey = c.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return c.json({ error: 'Backend GEMINI_API_KEY is not configured' }, 500);
  }

  try {
    const body = await c.req.json<{ 
      image: string; 
      action: string; 
      customPrompt?: string;
    }>();

    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const base64Data = body.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const actionMap: Record<string, string> = {
      'run': 'running cycle. Body leans forward slightly. Legs (if exist) move dynamically. If floating, body bobs forward.',
      'walk': 'walking cycle. Gentle movement. strictly facing right.',
      'idle': 'idle breathing. Minimal movement. Chest expands/contracts. Strictly facing right.',
      'attack': 'Melee attack animation. SWING the weapon/body part forward. DO NOT throw the object. Keep hold of the weapon at all times. Frames 1-4: Wind up back. Frames 5-8: Swing forward. Frames 9-12: Impact pose. Frames 13-16: Return to start.',
      'hit': 'taking damage / hit reaction. Character recoils after being struck, slight knockback, spark impact. Maintain facing right.',
      'jump': 'Vertical jump. Frames 1-4: Anticipation (Squash). Frames 5-8: Upward movement. Frames 9-12: Apex/Hover. Frames 13-16: Landing (Stretch/Squash).',
      'die': 'Death animation. Character collapses or dissolves on the spot.',
      'custom': body.customPrompt || 'performing an action'
    };

    const actionDescription = body.action === 'custom'
      ? (body.customPrompt || 'performing an action')
      : (actionMap[body.action] || body.action);

    const prompt = `
      You are a strictly disciplined Pixel Art Engine. Generate a 4x4 Sprite Sheet (16 frames).

      INPUT IMAGE IS THE ABSOLUTE TRUTH.
      
      ACTION: ${actionDescription}
      
      [MODULE 1: VISUAL FIDELITY & ANATOMY] (CRITICAL)
      1. **NO HALLUCINATION**: Look at the input image. 
         - If the character has NO FEET (floating/ghost), DO NOT DRAW FEET.
         - If the character has NO LEGS, DO NOT ADD LEGS.
      2. **OBJECT PERMANENCE**: 
         - Every detail from the input image (hats, capes, weapon color, eye color) MUST remain identical across all 16 frames.
         - Do not change the color palette. Use the EXACT colors from the input image.
      
      [MODULE 2: ANIMATION LOGIC]
      1. **4x4 GRID**: Output must be a single image containing a 4x4 grid of frames.
      2. **SMOOTH LOOP**: Frame 16 should transition perfectly back to Frame 1.
      3. **PHYSICS**: Follow the action description provided. Maintain weight and momentum.
      
      [MODULE 3: OUTPUT FORMAT]
      1. **PIXEL ART STYLE**: Sharp edges, no blur, no shadows unless they are in the input image.
      2. **TRANSPARENT/SOLID BACKGROUND**: Use the same background as the input image.
      3. **STRICTLY 16 FRAMES**: No more, no less.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      }
    ]);

    const response = await result.response;
    
    // 提取生成的图片
    let generatedImageBase64 = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if (part.inlineData?.data) {
        generatedImageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!generatedImageBase64) {
      // 如果没有直接返回图片，尝试从文本中提取（某些模型版本可能不同）
      const text = response.text();
      // 这里可以根据实际情况增加更多的解析逻辑
      return c.json({ error: 'No image data returned from Gemini', details: text }, 500);
    }
    
    return c.json({ 
      imageUrl: generatedImageBase64,
      promptUsed: prompt
    });

  } catch (error: any) {
    console.error('Gemini generation error:', error);
    return c.json({ error: error.message || 'Failed to generate content' }, 500);
  }
});

export default ai;
