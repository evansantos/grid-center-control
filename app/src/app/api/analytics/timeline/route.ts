import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-error';
import { readFile, readdir, access, stat } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { AGENTS_DIR } from '@/lib/constants';

interface TimelineEntry {
  type: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'thinking';
  startMs: number;
  durationMs: number;
  label: string;
  detail: string;
}

let cache: { key: string; data: unknown; ts: number } | null = null;

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { return false; } }

async function resolveSessionFile(sessionKey: string): Promise<string | null> {
  const agents = await readdir(AGENTS_DIR).catch(() => []);
  for (const agent of agents) {
    const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
    const candidate = path.join(sessionsDir, `${sessionKey}.jsonl`);
    if (await exists(candidate)) return candidate;
  }
  return null;
}

async function listSessions() {
  const agents = await readdir(AGENTS_DIR).catch(() => []);
  const sessions: { key: string; agentId: string; date: string }[] = [];
  for (const agent of agents) {
    const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
    if (!(await exists(sessionsDir))) continue;
    const files = await readdir(sessionsDir).catch(() => []);
    for (const file of files) {
      if (!file.endsWith('.jsonl')) continue;
      const filePath = path.join(sessionsDir, file);
      try {
        const s = await stat(filePath);
        sessions.push({
          key: file.replace(/\.jsonl$/, ''),
          agentId: agent,
          date: s.mtime.toISOString(),
        });
      } catch { /* skip */ }
    }
  }
  sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sessions.slice(0, 100);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get('list') === 'true') {
    const sessions = await listSessions();
    return NextResponse.json({ sessions });
  }

  const sessionKey = searchParams.get('sessionKey');
  if (!sessionKey) {
    return NextResponse.json({ error: 'sessionKey required' }, { status: 400 });
  }

  const now = Date.now();
  if (cache && cache.key === sessionKey && now - cache.ts < 30_000) {
    return NextResponse.json(cache.data);
  }

  const filePath = await resolveSessionFile(sessionKey);
  if (!filePath) {
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

        const entryType = parsed.type;

        // Skip non-conversation types
        if (!entryType || !['user', 'assistant', 'tool_use', 'tool_result', 'thinking'].includes(entryType)) {
          prevTs = ts;
          continue;
        }

        let type: TimelineEntry['type'] = 'assistant';
        let label = '';
        let detail = '';

        if (entryType === 'user') {
          type = 'user';
          label = 'User';
          detail = typeof parsed.content === 'string' ? parsed.content.slice(0, 200) : '';
        } else if (entryType === 'thinking') {
          type = 'thinking';
          label = 'Thinking';
          detail = typeof parsed.thinking === 'string' ? parsed.thinking.slice(0, 200) : '';
        } else if (entryType === 'assistant') {
          type = 'assistant';
          label = 'Response';
          detail = typeof parsed.content === 'string' ? parsed.content.slice(0, 200) : '';
        } else if (entryType === 'tool_use') {
          type = 'tool_call';
          label = parsed.name || 'Tool';
          detail = JSON.stringify(parsed.input || '').slice(0, 200);
        } else if (entryType === 'tool_result') {
          type = 'tool_result';
          label = parsed.name || 'Result';
          detail = typeof parsed.content === 'string' ? parsed.content.slice(0, 200) : JSON.stringify(parsed.content || '').slice(0, 200);
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
