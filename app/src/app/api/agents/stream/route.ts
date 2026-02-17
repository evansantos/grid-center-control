import { NextRequest } from 'next/server';
import { subscribeAgentStatus, AgentStatus } from '@/lib/sse-poller';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const onStatus = (statuses: Record<string, AgentStatus>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', statuses })}\n\n`));
        } catch { /* stream closed */ }
      };

      const unsubscribe = subscribeAgentStatus(onStatus);

      setTimeout(() => {
        unsubscribe();
        try { controller.close(); } catch { /* already closed */ }
      }, 5 * 60 * 1000);

      req.signal.addEventListener('abort', () => {
        unsubscribe();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
