import { NextRequest } from 'next/server';
import { subscribeStream, getAgentList } from '@/lib/sse-poller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;

  const initialAgents = await getAgentList();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch { /* stream closed */ }
      };

      const heartbeat = setInterval(() => send('ping', { ts: Date.now() }), 15000);

      const unsubscribe = subscribeStream(send);

      send('connected', { agents: initialAgents, timestamp: new Date().toISOString() });

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
