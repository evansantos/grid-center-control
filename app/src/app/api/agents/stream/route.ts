import { NextRequest } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import os from 'os';

const OPENCLAW_DIR = join(os.homedir(), '.openclaw');

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { /* existence check — expected */ return false; } }

async function getAgentStatuses() {
  try {
    let config: any;
    try {
      config = JSON.parse(await readFile(join(OPENCLAW_DIR, 'openclaw.json'), 'utf-8'));
    } catch (err) { console.error("[agents/stream] config read failed", err);
      config = { agents: { list: [] } };
    }
    const agentList = config.agents?.list ?? [];
    const statuses: Record<string, { active: boolean; lastActivity?: string }> = {};

    for (const agent of agentList) {
      const id = agent.id;
      const sessionsDir = join(OPENCLAW_DIR, 'agents', id, 'sessions');
      let lastMtime = 0;

      if (await exists(sessionsDir)) {
        try {
          const files = (await readdir(sessionsDir)).filter((f: string) => f.endsWith('.jsonl'));
          for (const file of files) {
            const s = await stat(join(sessionsDir, file));
            if (s.mtimeMs > lastMtime) lastMtime = s.mtimeMs;
          }
        } catch (err) { console.error(err); }
      }

      const statusKey = id === 'main' ? 'mcp' : id;
      statuses[statusKey] = {
        active: lastMtime > 0 && (Date.now() - lastMtime) < 30_000,
        lastActivity: lastMtime > 0 ? new Date(lastMtime).toISOString() : undefined,
      };
    }

    return statuses;
  } catch (err) { console.error("[agents/stream] getAgentStatuses error", err);
    return {};
  }
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        try {
          const statuses = await getAgentStatuses();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', statuses })}\n\n`));
        } catch (err) { console.error("[agents/stream] send status error", err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`));
        }
      };

      send();
      const interval = setInterval(send, 5000);

      setTimeout(() => {
        clearInterval(interval);
        try { controller.close(); } catch (err) { console.error(err); }
      }, 5 * 60 * 1000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch (err) { console.error(err); }
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
