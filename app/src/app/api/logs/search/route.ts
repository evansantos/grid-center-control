import { NextResponse } from 'next/server';
import path from 'path';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { AGENTS_DIR } from '@/lib/constants';

interface SearchResult {
  sessionKey: string;
  agentId: string;
  timestamp: string;
  role: string;
  content: string;
  matchHighlight: string;
}

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { return false; } }

/* ── LRU Cache (max 20 entries, 30s TTL) ── */
const LRU_MAX = 20;
const LRU_TTL = 30_000;
const lruCache = new Map<string, { data: unknown; ts: number }>();

function lruGet(key: string): unknown | undefined {
  const entry = lruCache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > LRU_TTL) {
    lruCache.delete(key);
    return undefined;
  }
  lruCache.delete(key);
  lruCache.set(key, entry);
  return entry.data;
}

function lruSet(key: string, data: unknown): void {
  if (lruCache.has(key)) lruCache.delete(key);
  lruCache.set(key, { data, ts: Date.now() });
  while (lruCache.size > LRU_MAX) {
    const oldest = lruCache.keys().next().value!;
    lruCache.delete(oldest);
  }
}

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
  const cached = lruGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const startTime = performance.now();
  const now = Date.now();
  const cutoff = now - hours * 3600_000;
  const queryLower = q.toLowerCase();
  const results: SearchResult[] = [];

  try {
    if (!(await exists(AGENTS_DIR))) {
      return NextResponse.json({ results: [], count: 0, searchTimeMs: 0 });
    }

    const agentDirs = await readdir(AGENTS_DIR);

    for (const agentId of agentDirs) {
      if (results.length >= limit) break;
      if (agent && agentId !== agent) continue;

      const sessionsDir = path.join(AGENTS_DIR, agentId, 'sessions');
      if (!(await exists(sessionsDir))) continue;

      let files: string[];
      try {
        files = (await readdir(sessionsDir)).filter(f => f.endsWith('.jsonl'));
      } catch { continue; }

      for (const file of files) {
        if (results.length >= limit) break;
        const filePath = path.join(sessionsDir, file);
        const sessionKey = file.replace('.jsonl', '');

        try {
          const fileStat = await stat(filePath);
          if (fileStat.mtimeMs < cutoff) continue;

          const content = await readFile(filePath, 'utf-8');
          const lines = content.trim().split('\n').filter(Boolean);

          for (const line of lines) {
            if (results.length >= limit) break;
            try {
              const parsed = JSON.parse(line);
              
              // Only process message entries
              if (parsed.type !== 'message' || !parsed.message) continue;
              
              const ts = parsed.timestamp || parsed.ts || '';
              if (ts && new Date(ts).getTime() < cutoff) continue;

              // Extract text content from message.content array
              let msgContent = '';
              const messageContent = parsed.message.content;
              
              if (Array.isArray(messageContent)) {
                // Handle content as array of blocks
                for (const block of messageContent) {
                  if (typeof block === 'string') {
                    msgContent += block + ' ';
                  } else if (block && typeof block === 'object' && block.type === 'text' && block.text) {
                    msgContent += block.text + ' ';
                  }
                }
              } else if (typeof messageContent === 'string') {
                // Handle legacy string content
                msgContent = messageContent;
              }

              msgContent = msgContent.trim();
              if (!msgContent || !msgContent.toLowerCase().includes(queryLower)) continue;

              const idx = msgContent.toLowerCase().indexOf(queryLower);
              const start = Math.max(0, idx - 50);
              const end = Math.min(msgContent.length, idx + q.length + 50);
              const highlight = (start > 0 ? '...' : '') + msgContent.slice(start, end) + (end < msgContent.length ? '...' : '');

              results.push({
                sessionKey,
                agentId,
                timestamp: ts,
                role: parsed.message.role || 'unknown',
                content: msgContent.slice(0, 500),
                matchHighlight: highlight,
              });
            } catch (err) { console.error(`Error parsing line in ${filePath}:`, err); }
          }
        } catch (err) { console.error(err); }
      }
    }
  } catch (err) { console.error(err); }

  const searchTimeMs = Math.round(performance.now() - startTime);
  const data = { results, count: results.length, searchTimeMs };
  lruSet(cacheKey, data);
  return NextResponse.json(data);
}
