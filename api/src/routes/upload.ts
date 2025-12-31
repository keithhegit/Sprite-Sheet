import { Hono } from 'hono';
import { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const upload = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

const resolveR2Key = (prefix: string | undefined, key: string): string => {
  const normalized = (prefix || '').trim().replace(/^\/+|\/+$/g, '');
  if (!normalized) return key;
  return `${normalized}/${key}`;
};

// 上传相关路由需要认证
upload.use('/upload/*', authMiddleware);

// ==================================================================================
// 上传原始图片到 R2
// ==================================================================================

upload.post('/upload/original', async (c) => {
  const userId = c.get('userId');
  
  try {
    const body = await c.req.json<{ image: string }>();
    
    if (!body.image) {
      return c.json({ error: 'Image data is required' }, 400);
    }
    
    // 提取 base64 数据
    const matches = body.image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) {
      return c.json({ error: 'Invalid image format' }, 400);
    }
    
    const mimeType = `image/${matches[1]}`;
    const base64Data = matches[2];
    
    // 将 base64 转换为 ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 生成唯一的文件名
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const key = resolveR2Key(c.env.R2_PREFIX, `originals/${userId}/${timestamp}-${randomId}.png`);
    
    // 上传到 R2
    await c.env.R2.put(key, bytes.buffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });
    
    return c.json({ key });
    
  } catch (error: any) {
    console.error('Upload original error:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// ==================================================================================
// 上传精灵图到 R2
// ==================================================================================

upload.post('/upload/sprite', async (c) => {
  const userId = c.get('userId');
  
  try {
    const body = await c.req.json<{
      image: string;
      actionId: string;
      historyId?: string;
    }>();
    
    if (!body.image || !body.actionId) {
      return c.json({ error: 'Image data and actionId are required' }, 400);
    }
    
    // 提取 base64 数据
    const matches = body.image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!matches) {
      return c.json({ error: 'Invalid image format' }, 400);
    }
    
    const mimeType = `image/${matches[1]}`;
    const base64Data = matches[2];
    
    // 将 base64 转换为 ArrayBuffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 生成文件名
    const timestamp = Date.now();
    const historyId = body.historyId || crypto.randomUUID().slice(0, 8);
    const key = resolveR2Key(c.env.R2_PREFIX, `sprites/${userId}/${historyId}/${body.actionId}-${timestamp}.png`);
    
    // 上传到 R2
    await c.env.R2.put(key, bytes.buffer, {
      httpMetadata: {
        contentType: mimeType,
      },
    });
    
    return c.json({ key });
    
  } catch (error: any) {
    console.error('Upload sprite error:', error);
    return c.json({ error: 'Failed to upload sprite' }, 500);
  }
});

// ==================================================================================
// 批量上传精灵图
// ==================================================================================

upload.post('/upload/sprites/batch', async (c) => {
  const userId = c.get('userId');
  
  try {
    const body = await c.req.json<{
      historyId: string;
      sprites: Array<{
        image: string;
        actionId: string;
      }>;
    }>();
    
    if (!body.historyId || !body.sprites || body.sprites.length === 0) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
    
    const results: Array<{ actionId: string; key: string }> = [];
    
    for (const sprite of body.sprites) {
      // 提取 base64 数据
      const matches = sprite.image.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
      if (!matches) {
        console.error(`Invalid image format for action ${sprite.actionId}`);
        continue;
      }
      
      const mimeType = `image/${matches[1]}`;
      const base64Data = matches[2];
      
      // 转换为 ArrayBuffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // 生成文件名
      const timestamp = Date.now();
      const key = resolveR2Key(c.env.R2_PREFIX, `sprites/${userId}/${body.historyId}/${sprite.actionId}-${timestamp}.png`);
      
      // 上传到 R2
      await c.env.R2.put(key, bytes.buffer, {
        httpMetadata: {
          contentType: mimeType,
        },
      });
      
      results.push({ actionId: sprite.actionId, key });
    }
    
    return c.json({ results });
    
  } catch (error: any) {
    console.error('Batch upload error:', error);
    return c.json({ error: 'Failed to upload sprites' }, 500);
  }
});

// ==================================================================================
// 获取图片（代理 R2）
// ==================================================================================

upload.get('/image/:key{.+}', async (c) => {
  try {
    const key = c.req.param('key');
    
    const object =
      (await c.env.R2.get(key)) ||
      (c.env.R2_PREFIX ? await c.env.R2.get(resolveR2Key(c.env.R2_PREFIX, key)) : null);
    
    if (!object) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000'); // 缓存 1 年
    
    return new Response(object.body, { headers });
    
  } catch (error: any) {
    console.error('Get image error:', error);
    return c.json({ error: 'Failed to fetch image' }, 500);
  }
});

export { upload as uploadRoutes };

