import { Hono } from 'hono';
import { Env } from '../types';
import { signJWT, verifyJWT } from '../utils/jwt';
import * as bcrypt from 'bcryptjs';

const auth = new Hono<{ Bindings: Env }>();

// ==================================================================================
// 注册 (仅限 @ogcloud.com)
// ==================================================================================

auth.post('/register', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email?: string; password?: string }>();

    if (!email || !password) {
      return c.json({ error: '请输入邮箱和密码' }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith('@ogcloud.com')) {
      return c.json({ error: '仅限 @ogcloud.com 邮箱注册' }, 403);
    }

    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(normalizedEmail).first();

    if (existingUser) {
      return c.json({ error: '该邮箱已被注册' }, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = crypto.randomUUID();
    const now = Date.now();

    await c.env.DB.prepare(`
      INSERT INTO users (id, email, nickname, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, normalizedEmail, null, passwordHash, now, now).run();

    const token = await signJWT(
      {
        userId,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: { id: userId, email: normalizedEmail, avatar_url: null },
    });

  } catch (error: any) {
    console.error('Register error:', error);
    return c.json({ error: '注册失败，请稍后重试' }, 500);
  }
});

// ==================================================================================
// 登录
// ==================================================================================

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email?: string; password?: string }>();

    if (!email || !password) {
      return c.json({ error: '请输入邮箱和密码' }, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await c.env.DB.prepare(
      'SELECT id, email, avatar_url, password_hash FROM users WHERE email = ?'
    ).bind(normalizedEmail).first();

    if (!user || !user.password_hash) {
      return c.json({ error: '邮箱或密码错误' }, 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash as string);

    if (!isValid) {
      return c.json({ error: '邮箱或密码错误' }, 401);
    }

    const token = await signJWT(
      {
        userId: user.id as string,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: '登录失败，请稍后重试' }, 500);
  }
});

// ==================================================================================
// 获取当前用户信息
// ==================================================================================

auth.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ user: null });
  }
  
  try {
    const token = authHeader.slice(7);
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    
    if (!payload || !payload.userId) {
      return c.json({ user: null });
    }
    
    const user = await c.env.DB.prepare(
      'SELECT id, email, avatar_url FROM users WHERE id = ?'
    ).bind(payload.userId).first();
    
    return c.json({ user });
    
  } catch (error) {
    console.error('Auth /me error:', error);
    return c.json({ user: null });
  }
});

// ==================================================================================
// 退出登录
// ==================================================================================

auth.post('/logout', async (c) => {
  return c.json({ success: true });
});

export { auth as authRoutes };
