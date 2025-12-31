import { Hono } from 'hono';
import { Env } from './types';
import { authRoutes } from './routes/auth';
import { historyRoutes } from './routes/history';
import { uploadRoutes } from './routes/upload';
import aiRoutes from './routes/ai';

const app = new Hono<{ Bindings: Env }>();

app.use('*', async (c, next) => {
  const origin = c.req.header('Origin') || '';
  const frontendUrl = (c.env.FRONTEND_URL || '').trim();

  const allowedOrigins = new Set<string>([
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ]);
  if (frontendUrl) allowedOrigins.add(frontendUrl);

  const requestHeaders = c.req.header('Access-Control-Request-Headers') || 'Content-Type, Authorization';
  const allowOrigin =
    origin &&
    (allowedOrigins.has(origin) || origin.endsWith('.pages.dev'));

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin ? origin : (frontendUrl || 'http://localhost:3000'),
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': requestHeaders,
  };

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  await next();

  for (const [k, v] of Object.entries(corsHeaders)) {
    c.res.headers.set(k, v);
  }
});

// ==================================================================================
// 路由挂载
// ==================================================================================

app.route('/api/auth', authRoutes);
app.route('/api/history', historyRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api', uploadRoutes);

// ==================================================================================
// 健康检查
// ==================================================================================

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  });
});

// ==================================================================================
// 根路径
// ==================================================================================

app.get('/', (c) => {
  return c.json({
    message: 'OgSprite API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      history: '/api/history/*',
      upload: '/api/upload/*',
      image: '/api/image/*',
    },
  });
});

// ==================================================================================
// 404 处理
// ==================================================================================

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// ==================================================================================
// 错误处理
// ==================================================================================

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

export default app;
