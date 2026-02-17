import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SearchResult {
  sessionKey: string;
  agentId: string;
  timestamp: string;
  role: string;
  content: string;
  matchHighlight: string;
}

const SESSIONS_DIR = path.join(process.env.HOME || '~', '.openclaw', 'sessions');
let cache: { key: string; data: any; ts: number } | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const agent = searchParams.get('agent') || '';
  const hours = parseInt(searchParams.get('hours') || '24', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  if (!q) {
    return NextResponse.json({ results: [], count: 0, searchTimeMs: 0 });
  }

  const cacheKey = `${q}:${agent}:${hours}:${limit}`;
  const now = Date.now();
  if (cache && cache.key === cacheKey && now - cache.ts < 10_000) {
    return NextResponse.json(cache.data);
  }

  const startTime = performance.now();
  const cutoff = now - hours * 3600_000;
  const queryLower = q.toLowerCase();
  const results: SearchResult[] = [];

  try {
    if (!fs.existsSync(SESSIONS_DIR)) {
      return NextResponse.json({ results: [], count: 0, searchTimeMs: 0 });
    }

    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));

    for (const file of files) {
      if (results.length >= limit) break;
      const sessionKey = file.replace('.jsonl', '');
      const parts = sessionKey.split(':');
      const agentId = parts[1] || 'unknown';

      if (agent && agentId !== agent) continue;

      try {
        const stat = fs.statSync(path.join(SESSIONS_DIR, file));
        if (stat.mtimeMs < cutoff) continue;

        const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);

        for (const line of lines) {
          if (results.length >= limit) break;
          try {
            const parsed = JSON.parse(line);
            const ts = parsed.timestamp || parsed.ts || '';
            if (ts && new Date(ts).getTime() < cutoff) continue;

            const msgContent = typeof parsed.content === 'string'
              ? parsed.content
              : JSON.stringify(parsed.content || '');

            if (!msgContent.toLowerCase().includes(queryLower)) continue;

            // Create highlight
            const idx = msgContent.toLowerCase().indexOf(queryLower);
            const start = Math.max(0, idx - 50);
            const end = Math.min(msgContent.length, idx + q.length + 50);
            const highlight = (start > 0 ? '...' : '') + msgContent.slice(start, end) + (end < msgContent.length ? '...' : '');

            results.push({
              sessionKey,
              agentId,
              timestamp: ts,
              role: parsed.role || 'unknown',
              content: msgContent.slice(0, 500),
              matchHighlight: highlight,
            });
          } catch {}
        }
      } catch {}
    }
  } catch {}

  const searchTimeMs = Math.round(performance.now() - startTime);
  const data = { results, count: results.length, searchTimeMs };
  cache = { key: cacheKey, data, ts: now };
  return NextResponse.json(data);
}
