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

async function exists(p: string) {
  try { await access(p, constants.R_OK); return true; } catch { return false; }
}

async function resolveSessionFile(sessionKey: string): Promise<string | null> {
  const agents = await readdir(AGENTS_DIR).catch(() => []);
  for (const agent of agents) {
    const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
    // Check exact match first, then search for matching UUID prefix
    const candidate = path.join(sessionsDir, `${sessionKey}.jsonl`);
    if (await exists(candidate)) return candidate;

    // Also check deleted sessions
    try {
      const files = await readdir(sessionsDir);
      const match = files.find(f => f.startsWith(sessionKey) && f.includes('.jsonl'));
      if (match) return path.join(sessionsDir, match);
    } catch { /* skip */ }
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
      if (!file.includes('.jsonl')) continue;
      const filePath = path.join(sessionsDir, file);
      try {
        const s = await stat(filePath);
        // Extract UUID from filename (before first .jsonl)
        const key = file.split('.jsonl')[0];
        sessions.push({
          key,
          agentId: agent,
          date: s.mtime.toISOString(),
        });
      } catch { /* skip */ }
    }
  }
  sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sessions.slice(0, 100);
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content.slice(0, 200);
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === 'text' && block.text) return String(block.text).slice(0, 200);
    }
  }
  return '';
}

function extractToolCalls(content: unknown): { name: string; input: string }[] {
  const calls: { name: string; input: string }[] = [];
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === 'toolCall' || block.type === 'tool_use') {
        calls.push({
          name: block.name || block.toolName || 'tool',
          input: JSON.stringify(block.input || block.args || '').slice(0, 200),
        });
      }
    }
  }
  return calls;
}

function hasThinking(content: unknown): string {
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === 'thinking' && block.text) return String(block.text).slice(0, 200);
    }
  }
  return '';
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

        const startMs = prevTs || ts;
        const durationMs = prevTs ? Math.max(0, ts - prevTs) : 0;

        if (parsed.type === 'message') {
          const msg = parsed.message || parsed;
          const role = msg.role || parsed.role;
          const msgContent = msg.content || parsed.content;

          if (role === 'user') {
            entries.push({
              type: 'user',
              startMs, durationMs,
              label: 'User',
              detail: extractText(msgContent),
            });
          } else if (role === 'assistant') {
            // Check for thinking blocks
            const thinking = hasThinking(msgContent);
            if (thinking) {
              entries.push({
                type: 'thinking',
                startMs, durationMs: Math.floor(durationMs * 0.4),
                label: 'Thinking',
                detail: thinking,
              });
            }

            // Check for tool calls
            const tools = extractToolCalls(msgContent);
            if (tools.length > 0) {
              for (const tool of tools) {
                entries.push({
                  type: 'tool_call',
                  startMs,
                  durationMs: Math.floor(durationMs / tools.length),
                  label: tool.name,
                  detail: tool.input,
                });
              }
            }

            // Main response text
            const text = extractText(msgContent);
            if (text && !tools.length) {
              entries.push({
                type: 'assistant',
                startMs, durationMs,
                label: 'Response',
                detail: text,
              });
            }
          } else if (role === 'toolResult' || role === 'tool') {
            entries.push({
              type: 'tool_result',
              startMs, durationMs,
              label: 'Result',
              detail: extractText(msgContent),
            });
          }
        }

        prevTs = ts;
      } catch { /* skip malformed lines */ }
    }

    const totalMs = entries.length > 1
      ? entries[entries.length - 1].startMs - entries[0].startMs
      : 0;
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
