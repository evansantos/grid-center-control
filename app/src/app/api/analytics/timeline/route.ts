import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-error';
import { readFile, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';

interface TimelineEntry {
  type: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'thinking';
  startMs: number;
  durationMs: number;
  label: string;
  detail: string;
}

const SESSIONS_DIR = path.join(os.homedir(), '.openclaw', 'sessions');
let cache: { key: string; data: unknown; ts: number } | null = null;

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { return false; } }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = searchParams.get('sessionKey');
  if (!sessionKey) {
    return NextResponse.json({ error: 'sessionKey required' }, { status: 400 });
  }

  const now = Date.now();
  if (cache && cache.key === sessionKey && now - cache.ts < 30_000) {
    return NextResponse.json(cache.data);
  }

  const filePath = path.join(SESSIONS_DIR, `${sessionKey}.jsonl`);
  if (!(await exists(filePath))) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const entries: TimelineEntry[] = [];
    let prevTs = 0;

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const ts = new Date(parsed.timestamp || parsed.ts || 0).getTime();
        if (!ts) continue;

        let type: TimelineEntry['type'] = 'assistant';
        let label = '';
        let detail = '';

        if (parsed.role === 'user') {
          type = 'user';
          label = 'User message';
          detail = typeof parsed.content === 'string' ? parsed.content.slice(0, 200) : '';
        } else if (parsed.role === 'assistant') {
          if (parsed.thinking) {
            type = 'thinking';
            label = 'Thinking';
            detail = typeof parsed.thinking === 'string' ? parsed.thinking.slice(0, 200) : '';
          } else {
            type = 'assistant';
            label = 'Response';
            detail = typeof parsed.content === 'string' ? parsed.content.slice(0, 200) : '';
          }
        } else if (parsed.type === 'tool_call' || parsed.role === 'tool') {
          type = parsed.type === 'tool_call' ? 'tool_call' : 'tool_result';
          label = parsed.name || parsed.tool || 'Tool';
          detail = typeof parsed.content === 'string' ? parsed.content.slice(0, 200) : JSON.stringify(parsed.input || '').slice(0, 200);
        }

        const startMs = prevTs || ts;
        const durationMs = prevTs ? ts - prevTs : 0;
        prevTs = ts;

        entries.push({ type, startMs, durationMs, label, detail });
      } catch (err) { console.error(err); }
    }

    const totalMs = entries.length > 0 ? entries[entries.length - 1].startMs - entries[0].startMs : 0;
    const thinkingMs = entries.filter(e => e.type === 'thinking').reduce((s, e) => s + e.durationMs, 0);
    const toolMs = entries.filter(e => e.type === 'tool_call' || e.type === 'tool_result').reduce((s, e) => s + e.durationMs, 0);
    const responseMs = entries.filter(e => e.type === 'assistant').reduce((s, e) => s + e.durationMs, 0);

    const result = {
      entries,
      summary: {
        totalMs,
        thinkingPct: totalMs > 0 ? Math.round((thinkingMs / totalMs) * 100) : 0,
        toolPct: totalMs > 0 ? Math.round((toolMs / totalMs) * 100) : 0,
        responsePct: totalMs > 0 ? Math.round((responseMs / totalMs) * 100) : 0,
      },
    };

    cache = { key: sessionKey, data: result, ts: now };
    return NextResponse.json(result);
  } catch (e: unknown) {
    return apiError(e);
  }
}
