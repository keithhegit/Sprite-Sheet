import { Hono } from 'hono';
import { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const ai = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// 所有 AI 相关接口都需要认证
ai.use('/*', authMiddleware);

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

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

    const base64Data = body.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mimeType = body.image.match(/^data:(image\/(png|jpeg|jpg|webp));base64,/)?.[1] || 'image/png';

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

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json() as any;
      return c.json({ 
        error: 'Gemini API error', 
        details: errorData.error?.message || response.statusText,
        upstreamStatus: response.status,
      }, 502);
    }

    const data = await response.json() as any;
    
    // 提取生成的图片
    let generatedImageBase64 = '';
    const parts = data.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if (part.inlineData?.data) {
        generatedImageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!generatedImageBase64) {
      return c.json({ error: 'No image data returned from Gemini', details: 'The model did not return an image part.' }, 500);
    }

    return c.json({ 
      imageUrl: generatedImageBase64,
      promptUsed: prompt
    });

  } catch (error: any) {
    console.error('AI Route Error:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default ai;
