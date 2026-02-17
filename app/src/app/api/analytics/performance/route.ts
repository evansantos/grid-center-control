import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
  trend: number[]; // last 7 data points (sessions per period)
  health: 'healthy' | 'watch' | 'issues';
}

const AGENT_EMOJIS: Record<string, string> = {
  arch: '🏛️', grid: '🔴', dev: '💻', bug: '🐛', vault: '🔐',
  atlas: '🗺️', scribe: '📝', pixel: '🎨', sentinel: '🛡️', riff: '🎵',
  sage: '🧙', main: '👤', unknown: '❓',
};

const SESSIONS_DIR = path.join(process.env.HOME || '~', '.openclaw', 'sessions');
let cache: { data: AgentScorecard[]; ts: number } | null = null;

function readFirstAndLastLines(filePath: string, firstN: number, lastN: number): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  if (lines.length <= firstN + lastN) return lines;
  return [...lines.slice(0, firstN), ...lines.slice(-lastN)];
}

function computeScorecards(): AgentScorecard[] {
  const agentMap = new Map<string, {
    sessions: number; tokensIn: number; tokensOut: number;
    totalDuration: number; errors: number; lastActive: string;
    dailyCounts: Map<string, number>;
  }>();

  try {
    if (!fs.existsSync(SESSIONS_DIR)) return [];
    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));

    for (const file of files) {
      try {
        const sessionKey = file.replace('.jsonl', '');
        const parts = sessionKey.split(':');
        const agentId = parts[1] || 'unknown';
        const lines = readFirstAndLastLines(path.join(SESSIONS_DIR, file), 5, 20);
        if (lines.length === 0) continue;

        if (!agentMap.has(agentId)) {
          agentMap.set(agentId, {
            sessions: 0, tokensIn: 0, tokensOut: 0,
            totalDuration: 0, errors: 0, lastActive: '',
            dailyCounts: new Map(),
          });
        }
        const entry = agentMap.get(agentId)!;
        entry.sessions++;

        let firstTs = '', lastTs = '', hasError = false;
        let tIn = 0, tOut = 0;

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const ts = parsed.timestamp || parsed.ts || '';
            if (!firstTs && ts) firstTs = ts;
            if (ts) lastTs = ts;
            if (parsed.error) hasError = true;
            if (parsed.usage) {
              tIn += parsed.usage.input_tokens || parsed.usage.prompt_tokens || 0;
              tOut += parsed.usage.output_tokens || parsed.usage.completion_tokens || 0;
            }
          } catch {}
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
      } catch {}
    }
  } catch {}

  const results: AgentScorecard[] = [];
  for (const [agentId, data] of agentMap) {
    const errorRate = data.sessions > 0 ? (data.errors / data.sessions) * 100 : 0;
    // Build trend from last 7 days
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
  const data = computeScorecards();
  cache = { data, ts: now };
  return NextResponse.json(data);
}
