import { Context, Next } from 'hono';
import { Env } from '../types';
import { verifyJWT } from '../utils/jwt';

export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: { userId: string } }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  
  if (!payload || !payload.userId) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // 将 userId 存入上下文
  c.set('userId', payload.userId);
  
  await next();
};


