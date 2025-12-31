export async function onRequest(context: any) {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith('/api/')) {
    const workerUrl = (context.env?.WORKER_API_URL || '').toString().replace(/\/$/, '');
    if (!workerUrl) {
      return new Response(JSON.stringify({ 
        error: 'WORKER_API_URL is not set',
        message: '请在 Cloudflare Pages 后台的 Settings -> Functions -> Environment variables 中设置 WORKER_API_URL 变量，并指向你的 Worker 地址。'
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const targetRequest = new Request(workerUrl + url.pathname + url.search, context.request);
    return fetch(targetRequest);
  }

  return context.next();
}
