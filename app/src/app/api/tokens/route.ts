import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-error';
import { readFile, readdir, stat, access } from 'fs/promises';
import { constants } from 'fs';
import { join } from 'path';
import { AGENTS_DIR } from '@/lib/constants';

async function exists(p: string) { try { await access(p, constants.R_OK); return true; } catch { /* existence check */ return false; } }

// Module-level cache with 10s TTL
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 1000;

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  sessionCount: number;
}

interface TokenData {
  agents: Record<string, TokenUsage>;
  daily: Record<string, number>;
  total: { input: number; output: number; total: number };
}

async function fetchTokenUsage(): Promise<TokenData> {
  const agentsDir = AGENTS_DIR;
  const result: TokenData = { agents: {}, daily: {}, total: { input: 0, output: 0, total: 0 } };
  if (!(await exists(agentsDir))) return result;

  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const today = new Date().toISOString().split('T')[0];

  const allDirs = await readdir(agentsDir);
  const agentDirs: string[] = [];
  for (const d of allDirs) {
    try { if ((await stat(join(agentsDir, d))).isDirectory()) agentDirs.push(d); } catch (err) { console.error(err); }
  }

  for (const agentId of agentDirs) {
    const sessionsDir = join(agentsDir, agentId, 'sessions');
    if (!(await exists(sessionsDir))) continue;

    const displayAgent = agentId === 'main' ? 'mcp' : agentId;
    if (!result.agents[displayAgent]) {
      result.agents[displayAgent] = { inputTokens: 0, outputTokens: 0, totalTokens: 0, sessionCount: 0 };
    }

    const allFiles = await readdir(sessionsDir);
    const fileStats = await Promise.all(
      allFiles.filter(f => f.endsWith('.jsonl')).map(async f => {
        try { const s = await stat(join(sessionsDir, f)); return { name: f, mtime: s.mtimeMs }; } catch { /* stat failed */ return null; }
      })
    );
    const files = fileStats.filter((f): f is { name: string; mtime: number } => f !== null && f.mtime > cutoff);

    for (const file of files) {
      try {
        const content = await readFile(join(sessionsDir, file.name), 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());
        let hasSession = false;

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.type === 'session') hasSession = true;
            if (entry.usage) {
              const usage = entry.usage;
              const inputTokens = usage.input || 0;
              const outputTokens = usage.output || 0;
              const totalTokens = inputTokens + outputTokens;
              result.agents[displayAgent].inputTokens += inputTokens;
              result.agents[displayAgent].outputTokens += outputTokens;
              result.agents[displayAgent].totalTokens += totalTokens;
              result.daily[today] = (result.daily[today] || 0) + totalTokens;
              result.total.input += inputTokens;
              result.total.output += outputTokens;
              result.total.total += totalTokens;
            }
          } catch (err) { console.error(err); }
        }
        if (hasSession) result.agents[displayAgent].sessionCount++;
      } catch (err) { console.error(err); }
    }
  }
  return result;
}

export async function GET() {
  try {
    const cacheKey = 'tokens';
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && (now - cached.timestamp < CACHE_TTL)) return NextResponse.json(cached.data);

    const data = await fetchTokenUsage();
    cache.set(cacheKey, { data, timestamp: now });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return apiError(e);
  }
}
