export async function onRequest(context: any) {
  const url = new URL(context.request.url);

  if (url.pathname.startsWith('/api/')) {
    const workerUrl = (context.env?.WORKER_API_URL || '').toString().replace(/\/$/, '');
    if (!workerUrl) {
      return new Response('WORKER_API_URL is not set', { status: 500 });
    }
    const targetRequest = new Request(workerUrl + url.pathname + url.search, context.request);
    return fetch(targetRequest);
  }

  return context.next();
}
