import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface SessionStats {
  totalSessions: number;
  busiestDay: { date: string; count: number };
  avgPerDay: number;
  currentStreak: number;
  peakHours: number[];
}

const SESSIONS_DIR = path.join(process.env.HOME || '~', '.openclaw', 'sessions');
let cache: { data: { heatmap: HeatmapDay[]; stats: SessionStats }; ts: number } | null = null;

function computeSessionAnalytics() {
  const dayCounts = new Map<string, number>();
  const hourCounts = new Array(24).fill(0);
  let totalSessions = 0;

  try {
    if (!fs.existsSync(SESSIONS_DIR)) return emptyResult();
    const files = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8');
        const firstLine = content.split('\n')[0];
        if (!firstLine) continue;
        const parsed = JSON.parse(firstLine);
        const ts = parsed.timestamp || parsed.ts;
        if (!ts) continue;

        const date = new Date(ts);
        const day = ts.slice(0, 10);
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        hourCounts[date.getHours()]++;
        totalSessions++;
      } catch {}
    }
  } catch {}

  // Build heatmap for last 90 days
  const heatmap: HeatmapDay[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    heatmap.push({ date: key, count: dayCounts.get(key) || 0 });
  }

  // Stats
  let busiestDay = { date: '', count: 0 };
  for (const [date, count] of dayCounts) {
    if (count > busiestDay.count) busiestDay = { date, count };
  }

  // Streak
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((dayCounts.get(key) || 0) > 0) streak++;
    else break;
  }

  const peakHours = hourCounts
    .map((c, h) => ({ h, c }))
    .sort((a, b) => b.c - a.c)
    .slice(0, 5)
    .map(x => x.h);

  return {
    heatmap,
    stats: {
      totalSessions,
      busiestDay,
      avgPerDay: Math.round((totalSessions / Math.max(1, dayCounts.size)) * 10) / 10,
      currentStreak: streak,
      peakHours,
    },
  };
}

function emptyResult() {
  return {
    heatmap: [] as HeatmapDay[],
    stats: { totalSessions: 0, busiestDay: { date: '', count: 0 }, avgPerDay: 0, currentStreak: 0, peakHours: [] },
  };
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.ts < 300_000) {
    return NextResponse.json(cache.data);
  }
  const data = computeSessionAnalytics();
  cache = { data, ts: now };
  return NextResponse.json(data);
}
