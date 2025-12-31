import { Hono } from 'hono';
import { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const history = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

// 所有路由需要认证
history.use('/*', authMiddleware);

// ==================================================================================
// 获取用户的历史记录列表
// ==================================================================================

history.get('/', async (c) => {
  const userId = c.get('userId');
  
  try {
    // 获取历史记录
    const records = await c.env.DB.prepare(`
      SELECT 
        h.id,
        h.original_image_key,
        h.created_at
      FROM generation_history h
      WHERE h.user_id = ?
      ORDER BY h.created_at DESC
      LIMIT 100
    `).bind(userId).all();
    
    // 为每条历史记录获取对应的精灵图
    const historyWithSprites = await Promise.all(
      records.results.map(async (record: any) => {
        const sprites = await c.env.DB.prepare(`
          SELECT action_id, action_label, sprite_image_key, prompt_used
          FROM sprite_results
          WHERE history_id = ?
          ORDER BY created_at ASC
        `).bind(record.id).all();
        
        return {
          id: record.id,
          originalImageKey: record.original_image_key,
          createdAt: record.created_at,
          sprites: sprites.results.map((s: any) => ({
            actionId: s.action_id,
            actionLabel: s.action_label,
            spriteImageKey: s.sprite_image_key,
            promptUsed: s.prompt_used,
          })),
        };
      })
    );
    
    return c.json({ history: historyWithSprites });
    
  } catch (error: any) {
    console.error('Get history error:', error);
    return c.json({ error: 'Failed to fetch history' }, 500);
  }
});

// ==================================================================================
// 获取单条历史记录详情
// ==================================================================================

history.get('/:id', async (c) => {
  const userId = c.get('userId');
  const historyId = c.req.param('id');
  
  try {
    // 验证所有权
    const record = await c.env.DB.prepare(`
      SELECT id, original_image_key, created_at
      FROM generation_history
      WHERE id = ? AND user_id = ?
    `).bind(historyId, userId).first();
    
    if (!record) {
      return c.json({ error: 'Not found' }, 404);
    }
    
    // 获取精灵图
    const sprites = await c.env.DB.prepare(`
      SELECT action_id, action_label, sprite_image_key, prompt_used
      FROM sprite_results
      WHERE history_id = ?
      ORDER BY created_at ASC
    `).bind(historyId).all();
    
    return c.json({
      id: record.id,
      originalImageKey: record.original_image_key,
      createdAt: record.created_at,
      sprites: sprites.results.map((s: any) => ({
        actionId: s.action_id,
        actionLabel: s.action_label,
        spriteImageKey: s.sprite_image_key,
        promptUsed: s.prompt_used,
      })),
    });
    
  } catch (error: any) {
    console.error('Get history detail error:', error);
    return c.json({ error: 'Failed to fetch history detail' }, 500);
  }
});

// ==================================================================================
// 创建历史记录
// ==================================================================================

history.post('/', async (c) => {
  const userId = c.get('userId');
  
  try {
    const body = await c.req.json<{
      originalImageKey: string;
      sprites: Array<{
        actionId: string;
        actionLabel: string;
        spriteImageKey: string;
        promptUsed?: string;
      }>;
    }>();
    
    if (!body.originalImageKey || !body.sprites || body.sprites.length === 0) {
      return c.json({ error: 'Invalid request body' }, 400);
    }
    
    const historyId = crypto.randomUUID();
    const now = Date.now();
    
    // 插入历史记录
    await c.env.DB.prepare(`
      INSERT INTO generation_history (id, user_id, original_image_key, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(historyId, userId, body.originalImageKey, now).run();
    
    // 批量插入精灵图结果
    for (const sprite of body.sprites) {
      await c.env.DB.prepare(`
        INSERT INTO sprite_results (id, history_id, action_id, action_label, sprite_image_key, prompt_used, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        historyId,
        sprite.actionId,
        sprite.actionLabel,
        sprite.spriteImageKey,
        sprite.promptUsed || null,
        now
      ).run();
    }
    
    return c.json({ id: historyId, createdAt: now }, 201);
    
  } catch (error: any) {
    console.error('Create history error:', error);
    return c.json({ error: 'Failed to create history' }, 500);
  }
});

// ==================================================================================
// 删除历史记录
// ==================================================================================

history.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const historyId = c.req.param('id');
  
  try {
    // 验证所有权
    const record = await c.env.DB.prepare(`
      SELECT original_image_key
      FROM generation_history
      WHERE id = ? AND user_id = ?
    `).bind(historyId, userId).first();
    
    if (!record) {
      return c.json({ error: 'Not found' }, 404);
    }
    
    // 获取所有精灵图的 key
    const sprites = await c.env.DB.prepare(`
      SELECT sprite_image_key
      FROM sprite_results
      WHERE history_id = ?
    `).bind(historyId).all();
    
    // 删除 R2 中的图片
    try {
      await c.env.R2.delete(record.original_image_key as string);
      for (const sprite of sprites.results) {
        await c.env.R2.delete((sprite as any).sprite_image_key);
      }
    } catch (r2Error) {
      console.error('R2 delete error:', r2Error);
      // 即使 R2 删除失败，也继续删除数据库记录
    }
    
    // 删除数据库记录
    await c.env.DB.prepare('DELETE FROM sprite_results WHERE history_id = ?')
      .bind(historyId).run();
    await c.env.DB.prepare('DELETE FROM generation_history WHERE id = ?')
      .bind(historyId).run();
    
    return c.json({ success: true });
    
  } catch (error: any) {
    console.error('Delete history error:', error);
    return c.json({ error: 'Failed to delete history' }, 500);
  }
});

export { history as historyRoutes };


