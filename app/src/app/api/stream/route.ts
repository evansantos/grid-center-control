import { NextRequest } from 'next/server';
import fs from 'fs';
import { readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const AGENTS_DIR = path.join(os.homedir(), '.openclaw', 'agents');

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
        } catch { /* stream closed — expected when client disconnects */ }
      };

      const heartbeat = setInterval(() => send('ping', { ts: Date.now() }), 15000);
      const watchers: fs.FSWatcher[] = [];

      const setupWatchers = async () => {
        try {
          try { await access(AGENTS_DIR, constants.R_OK); } catch { /* agents dir missing */ return; }
          const allDirs = await readdir(AGENTS_DIR);
          const agents: string[] = [];
          for (const f of allDirs) {
            try { if ((await stat(path.join(AGENTS_DIR, f))).isDirectory()) agents.push(f); } catch (err) { console.error('[stream] stat failed', err); }
          }

          for (const agent of agents) {
            const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
            try { await access(sessionsDir, constants.R_OK); } catch { /* no sessions dir */ continue; }

            try {
              const watcher = fs.watch(sessionsDir, { recursive: true }, async (eventType, filename) => {
                if (!filename) return;
                let status: 'active' | 'recent' | 'idle' = 'idle';
                try {
                  const allFiles = await readdir(sessionsDir);
                  const fileStats = await Promise.all(
                    allFiles.filter(f => f.endsWith('.jsonl')).map(async f => {
                      try { const s = await stat(path.join(sessionsDir, f)); return { name: f, mtime: s.mtimeMs }; } catch { /* stat failed */ return null; }
                    })
                  );
                  const files = fileStats.filter((f): f is { name: string; mtime: number } => f !== null)
                    .sort((a, b) => b.mtime - a.mtime);
                  if (files.length > 0) {
                    const ageMs = Date.now() - files[0].mtime;
                    status = ageMs < 60_000 ? 'active' : ageMs < 600_000 ? 'recent' : 'idle';
                  }
                } catch (err) { console.error('[stream] status compute failed', err); }
                send('activity', { agent, eventType, filename: filename.toString(), timestamp: new Date().toISOString(), status });
              });
              watchers.push(watcher);
            } catch (err) { console.error('[stream] watch setup failed for', agent, err); }
          }
        } catch (err) {
          console.error('[SSE] Error setting up watchers:', err);
        }
      };

      setupWatchers();

      const setupRootWatcher = async () => {
        try {
          await access(AGENTS_DIR, constants.R_OK);
          const rootWatcher = fs.watch(AGENTS_DIR, (eventType, filename) => {
            if (filename) {
              send('agent-change', { eventType, agent: filename.toString(), timestamp: new Date().toISOString() });
            }
          });
          watchers.push(rootWatcher);
        } catch (err) { console.error('[stream] root watcher setup failed', err); }
      };
      setupRootWatcher();

      send('connected', { agents: initialAgents, timestamp: new Date().toISOString() });

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(heartbeat);
        watchers.forEach(w => { try { w.close(); } catch (err) { console.error('[stream] watcher close error', err); } });
        try { controller.close(); } catch (err) { console.error('[stream] controller close error', err); }
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

async function getAgentList(): Promise<string[]> {
  try {
    try { await access(AGENTS_DIR, constants.R_OK); } catch { /* agents dir not found — expected */ return []; }
    const allDirs = await readdir(AGENTS_DIR);
    const agents: string[] = [];
    for (const f of allDirs) {
      try { if ((await stat(path.join(AGENTS_DIR, f))).isDirectory()) agents.push(f); } catch (err) { console.error('[stream] getAgentList stat error', err); }
    }
    return agents;
  } catch (err) { console.error('[stream] getAgentList error', err); return []; }
}
