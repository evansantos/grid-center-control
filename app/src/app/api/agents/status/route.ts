import { NextResponse } from 'next/server';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

const OPENCLAW_DIR = join(process.env.HOME ?? '', '.openclaw');

export async function GET() {
  try {
    const config = JSON.parse(readFileSync(join(OPENCLAW_DIR, 'openclaw.json'), 'utf-8'));
    const agentList = config.agents?.list ?? [];

    const status: Record<string, { active: boolean; lastActivity?: string }> = {};

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

      // Map main → mcp in the status output key
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
