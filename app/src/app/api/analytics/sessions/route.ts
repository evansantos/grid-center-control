import { NextResponse } from 'next/server';
import { readFile, readdir, access, stat } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { AGENTS_DIR } from '@/lib/constants';

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  deletedSessions: number;
  busiestDay: { date: string; count: number };
  avgPerDay: number;
  currentStreak: number;
  peakHours: number[];
  agentBreakdown: { agentId: string; count: number }[];
  modelBreakdown: { model: string; count: number }[];
  totalTokensIn: number;
  totalTokensOut: number;
  avgSessionDurationSec: number;
}

let cache: { data: { heatmap: HeatmapDay[]; stats: SessionStats }; ts: number } | null = null;

async function exists(p: string) {
  try { await access(p, constants.R_OK); return true; } catch { return false; }
}

async function computeSessionAnalytics() {
  const dayCounts = new Map<string, number>();
  const hourCounts = new Array(24).fill(0);
  const agentCounts = new Map<string, number>();
  const modelCounts = new Map<string, number>();
  let totalSessions = 0;
  let activeSessions = 0;
  let deletedSessions = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let totalDurationMs = 0;
  let sessionsWithDuration = 0;

  try {
    if (!(await exists(AGENTS_DIR))) return emptyResult();
    const agents = await readdir(AGENTS_DIR);

    for (const agent of agents) {
      const sessionsDir = path.join(AGENTS_DIR, agent, 'sessions');
      if (!(await exists(sessionsDir))) continue;
      const files = await readdir(sessionsDir);

      let agentCount = 0;

      for (const file of files) {
        if (!file.includes('.jsonl')) continue;
        const isDeleted = file.includes('.deleted.');
        const filePath = path.join(sessionsDir, file);

        try {
          const content = await readFile(filePath, 'utf-8');
          const lines = content.trim().split('\n').filter(Boolean);
          if (lines.length === 0) continue;

          totalSessions++;
          agentCount++;
          if (isDeleted) deletedSessions++;
          else activeSessions++;

          // Parse first line for session start timestamp
          let firstTs = '';
          let lastTs = '';

          // Read first few and last few lines for timestamps and usage
          const checkLines = lines.length <= 10
            ? lines
            : [...lines.slice(0, 5), ...lines.slice(-5)];

          for (const line of checkLines) {
            try {
              const parsed = JSON.parse(line);
              const ts = parsed.timestamp || parsed.ts;
              if (!ts) continue;
              if (!firstTs) firstTs = ts;
              lastTs = ts;

              // Track model from model_change or model-snapshot
              if (parsed.type === 'model_change' && parsed.modelId) {
                const model = parsed.modelId;
                modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
              }
              if (parsed.type === 'custom' && parsed.customType === 'model-snapshot') {
                const model = parsed.data?.modelId;
                if (model) modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
              }

              // Collect usage from assistant messages
              if (parsed.usage) {
                totalTokensIn += (parsed.usage.input || 0) + (parsed.usage.cacheRead || 0);
                totalTokensOut += parsed.usage.output || 0;
              }
            } catch { /* skip */ }
          }

          if (firstTs) {
            const date = new Date(firstTs);
            const day = firstTs.slice(0, 10);
            dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
            hourCounts[date.getUTCHours()]++;
          }

          if (firstTs && lastTs && firstTs !== lastTs) {
            const dur = new Date(lastTs).getTime() - new Date(firstTs).getTime();
            if (dur > 0 && dur < 24 * 3600_000) {
              totalDurationMs += dur;
              sessionsWithDuration++;
            }
          }
        } catch { /* skip unreadable files */ }
      }

      if (agentCount > 0) {
        agentCounts.set(agent, agentCount);
      }
    }
  } catch { /* top-level error */ }

  // Build 90-day heatmap
  const heatmap: HeatmapDay[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    heatmap.push({ date: key, count: dayCounts.get(key) || 0 });
  }

  let busiestDay = { date: '', count: 0 };
  for (const [date, count] of dayCounts) {
    if (count > busiestDay.count) busiestDay = { date, count };
  }

  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((dayCounts.get(key) || 0) > 0) streak++;
    else break;
  }

  const peakHours = hourCounts
    .map((c: number, h: number) => ({ h, c }))
    .sort((a: { h: number; c: number }, b: { h: number; c: number }) => b.c - a.c)
    .slice(0, 5)
    .map((x: { h: number; c: number }) => x.h);

  const agentBreakdown = [...agentCounts.entries()]
    .map(([agentId, count]) => ({ agentId, count }))
    .sort((a, b) => b.count - a.count);

  const modelBreakdown = [...modelCounts.entries()]
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count);

  return {
    heatmap,
    stats: {
      totalSessions,
      activeSessions,
      deletedSessions,
      busiestDay,
      avgPerDay: Math.round((totalSessions / Math.max(1, dayCounts.size)) * 10) / 10,
      currentStreak: streak,
      peakHours,
      agentBreakdown,
      modelBreakdown,
      totalTokensIn,
      totalTokensOut,
      avgSessionDurationSec: sessionsWithDuration > 0 ? Math.round(totalDurationMs / sessionsWithDuration / 1000) : 0,
    },
  };
}

function emptyResult() {
  return {
    heatmap: [] as HeatmapDay[],
    stats: {
      totalSessions: 0, activeSessions: 0, deletedSessions: 0,
      busiestDay: { date: '', count: 0 }, avgPerDay: 0, currentStreak: 0,
      peakHours: [], agentBreakdown: [], modelBreakdown: [], totalTokensIn: 0, totalTokensOut: 0,
      avgSessionDurationSec: 0,
    },
  };
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < 300_000) {
    return NextResponse.json(cache.data);
  }
  const data = await computeSessionAnalytics();
  cache = { data, ts: now };
  return NextResponse.json(data);
}
