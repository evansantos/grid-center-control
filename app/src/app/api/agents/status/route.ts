import { NextResponse } from 'next/server';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import os from 'os';

const OPENCLAW_DIR = join(os.homedir(), '.openclaw');

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { /* existence check */ return false; } }

export async function GET() {
  try {
    let config: any;
    try {
      config = JSON.parse(await readFile(join(OPENCLAW_DIR, 'openclaw.json'), 'utf-8'));
    } catch (error) { /* config may not exist */
      config = { agents: { list: [] } };
    }
    const agentList = config.agents?.list ?? [];

    const status: Record<string, { active: boolean; lastActivity?: string }> = {};

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
      status[statusKey] = {
        active: lastMtime > 0 && (Date.now() - lastMtime) < 30_000,
        lastActivity: lastMtime > 0 ? new Date(lastMtime).toISOString() : undefined,
      };
    }

    return NextResponse.json({ status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
