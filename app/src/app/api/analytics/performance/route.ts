import { NextResponse } from 'next/server';
import { readFile, readdir, access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { AGENTS_DIR, AGENT_EMOJIS } from '@/lib/constants';

export interface AgentScorecard {
  agentId: string;
  emoji: string;
  sessionsCount: number;
  totalTokensIn: number;
  totalTokensOut: number;
  avgDurationSec: number;
  errorCount: number;
  errorRate: number;
  lastActive: string;
  trend: number[];
  health: 'healthy' | 'watch' | 'issues';
}

let cache: { data: AgentScorecard[]; ts: number } | null = null;

async function exists(p: string) {
  try { await access(p, constants.R_OK); return true; } catch { return false; }
}

async function readHeadTail(filePath: string, headN: number, tailN: number): Promise<string[]> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  if (lines.length <= headN + tailN) return lines;
  return [...lines.slice(0, headN), ...lines.slice(-tailN)];
}

async function computeScorecards(): Promise<AgentScorecard[]> {
  const agentMap = new Map<string, {
    sessions: number; tokensIn: number; tokensOut: number;
    totalDuration: number; errors: number; lastActive: string;
    dailyCounts: Map<string, number>;
  }>();

  try {
    if (!(await exists(AGENTS_DIR))) return [];
    const agents = await readdir(AGENTS_DIR);

    for (const agent of agents) {
      const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
      if (!(await exists(sessionsDir))) continue;

      // Include both active .jsonl and deleted sessions
      const files = (await readdir(sessionsDir)).filter(f => f.includes('.jsonl'));

      if (!agentMap.has(agent)) {
        agentMap.set(agent, {
          sessions: 0, tokensIn: 0, tokensOut: 0,
          totalDuration: 0, errors: 0, lastActive: '',
          dailyCounts: new Map(),
        });
      }
      const entry = agentMap.get(agent)!;

      for (const file of files) {
        try {
          const lines = await readHeadTail(path.join(sessionsDir, file), 5, 20);
          if (lines.length === 0) continue;

          entry.sessions++;
          let firstTs = '', lastTs = '', hasError = false;
          let tIn = 0, tOut = 0;

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const ts = parsed.timestamp || parsed.ts || '';
              if (!firstTs && ts) firstTs = ts;
              if (ts) lastTs = ts;

              // Check for errors in custom events
              if (parsed.type === 'custom' && parsed.customType === 'error') hasError = true;

              // Usage is at top level for assistant messages
              const usage = parsed.usage;
              if (usage) {
                tIn += usage.input || usage.input_tokens || usage.prompt_tokens || 0;
                tIn += usage.cacheRead || 0;
                tOut += usage.output || usage.output_tokens || usage.completion_tokens || 0;
              }
            } catch { /* skip malformed lines */ }
          }

          entry.tokensIn += tIn;
          entry.tokensOut += tOut;
          if (hasError) entry.errors++;
          if (firstTs && lastTs) {
            entry.totalDuration += Math.max(0, (new Date(lastTs).getTime() - new Date(firstTs).getTime()) / 1000);
          }
          if (lastTs > entry.lastActive) entry.lastActive = lastTs;

          const day = (firstTs || new Date().toISOString()).slice(0, 10);
          entry.dailyCounts.set(day, (entry.dailyCounts.get(day) || 0) + 1);
        } catch { /* skip unreadable files */ }
      }
    }
  } catch { /* top-level error */ }

  const results: AgentScorecard[] = [];
  for (const [agentId, data] of agentMap) {
    // Skip agents with no sessions
    if (data.sessions === 0) continue;

    const errorRate = data.sessions > 0 ? (data.errors / data.sessions) * 100 : 0;
    const trend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trend.push(data.dailyCounts.get(key) || 0);
    }

    results.push({
      agentId,
      emoji: AGENT_EMOJIS[agentId] || '❓',
      sessionsCount: data.sessions,
      totalTokensIn: data.tokensIn,
      totalTokensOut: data.tokensOut,
      avgDurationSec: data.sessions > 0 ? Math.round(data.totalDuration / data.sessions) : 0,
      errorCount: data.errors,
      errorRate: Math.round(errorRate * 10) / 10,
      lastActive: data.lastActive || 'never',
      trend,
      health: errorRate > 20 ? 'issues' : errorRate > 5 ? 'watch' : 'healthy',
    });
  }

  return results.sort((a, b) => b.sessionsCount - a.sessionsCount);
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < 60_000) {
    return NextResponse.json(cache.data);
  }
  const data = await computeScorecards();
  cache = { data, ts: now };
  return NextResponse.json(data);
}
