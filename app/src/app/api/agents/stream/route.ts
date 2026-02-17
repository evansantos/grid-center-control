import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

const OPENCLAW_DIR = join(process.env.HOME ?? '', '.openclaw');

function getAgentStatuses() {
  try {
    const config = JSON.parse(readFileSync(join(OPENCLAW_DIR, 'openclaw.json'), 'utf-8'));
    const agentList = config.agents?.list ?? [];
    const statuses: Record<string, { active: boolean; lastActivity?: string }> = {};

    for (const agent of agentList) {
      const id = agent.id;
      const sessionsDir = join(OPENCLAW_DIR, 'agents', id, 'sessions');
      let lastMtime = 0;

      if (existsSync(sessionsDir)) {
        try {
          const files = readdirSync(sessionsDir).filter((f: string) => f.endsWith('.jsonl'));
          for (const file of files) {
            const stat = statSync(join(sessionsDir, file));
            if (stat.mtimeMs > lastMtime) lastMtime = stat.mtimeMs;
          }
        } catch {}
      }

      const statusKey = id === 'main' ? 'mcp' : id;
      statuses[statusKey] = {
        active: lastMtime > 0 && (Date.now() - lastMtime) < 30_000,
        lastActivity: lastMtime > 0 ? new Date(lastMtime).toISOString() : undefined,
      };
    }

    return statuses;
  } catch {
    return {};
  }
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        try {
          const statuses = getAgentStatuses();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', statuses })}\n\n`));
        } catch {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`));
        }
      };

      send();
      const interval = setInterval(send, 5000);

      // Clean up after 5 minutes to prevent hanging connections
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 5 * 60 * 1000);
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
