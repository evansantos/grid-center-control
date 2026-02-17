import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AGENTS_DIR = path.join(process.env.HOME || '', '.openclaw', 'agents');

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch { /* stream closed */ }
      };

      // Send heartbeat every 15s to keep connection alive
      const heartbeat = setInterval(() => send('ping', { ts: Date.now() }), 15000);

      // Watch agent session directories
      const watchers: fs.FSWatcher[] = [];

      const setupWatchers = () => {
        try {
          if (!fs.existsSync(AGENTS_DIR)) return;
          const agents = fs.readdirSync(AGENTS_DIR).filter(f => {
            try { return fs.statSync(path.join(AGENTS_DIR, f)).isDirectory(); } catch { return false; }
          });

          for (const agent of agents) {
            const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
            if (!fs.existsSync(sessionsDir)) continue;

            try {
              const watcher = fs.watch(sessionsDir, { recursive: true }, (eventType, filename) => {
                if (!filename) return;
                
                // Compute agent status based on latest session file mtime
                let status: 'active' | 'recent' | 'idle' = 'idle';
                try {
                  const files = fs.readdirSync(sessionsDir)
                    .filter(f => f.endsWith('.jsonl'))
                    .map(f => ({ name: f, mtime: fs.statSync(path.join(sessionsDir, f)).mtimeMs }))
                    .sort((a, b) => b.mtime - a.mtime);
                  
                  if (files.length > 0) {
                    const ageMs = Date.now() - files[0].mtime;
                    status = ageMs < 60_000 ? 'active' : ageMs < 600_000 ? 'recent' : 'idle';
                  }
                } catch { /* keep status as idle */ }
                
                send('activity', {
                  agent,
                  eventType,
                  filename: filename.toString(),
                  timestamp: new Date().toISOString(),
                  status,
                });
              });
              watchers.push(watcher);
            } catch { /* skip agent if watch fails */ }
          }
        } catch (err) {
          console.error('[SSE] Error setting up watchers:', err);
        }
      };

      setupWatchers();

      // Also watch the agents dir itself for new agents
      try {
        if (fs.existsSync(AGENTS_DIR)) {
          const rootWatcher = fs.watch(AGENTS_DIR, (eventType, filename) => {
            if (filename) {
              send('agent-change', { eventType, agent: filename.toString(), timestamp: new Date().toISOString() });
            }
          });
          watchers.push(rootWatcher);
        }
      } catch { /* ignore */ }

      // Send initial state
      send('connected', { agents: getAgentList(), timestamp: new Date().toISOString() });

      // Cleanup on abort
      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(heartbeat);
        watchers.forEach(w => { try { w.close(); } catch {} });
        try { controller.close(); } catch {}
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

function getAgentList(): string[] {
  try {
    if (!fs.existsSync(AGENTS_DIR)) return [];
    return fs.readdirSync(AGENTS_DIR).filter(f => {
      try { return fs.statSync(path.join(AGENTS_DIR, f)).isDirectory(); } catch { return false; }
    });
  } catch { return []; }
}
