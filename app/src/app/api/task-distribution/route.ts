import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

interface DistributionEntry {
  agent: string;
  pending: number;
  in_progress: number;
  review: number;
  done: number;
  total: number;
}

export async function GET() {
  try {
    const db = getDB();
    const rows = db.prepare(
      `SELECT
         COALESCE(agent_session, 'unassigned') as agent,
         status,
         COUNT(*) as cnt
       FROM tasks
       GROUP BY agent_session, status`
    ).all() as Array<{ agent: string; status: string; cnt: number }>;

    const agentMap: Record<string, DistributionEntry> = {};

    for (const row of rows) {
      const agent = row.agent || 'unassigned';
      if (!agentMap[agent]) {
        agentMap[agent] = { agent, pending: 0, in_progress: 0, review: 0, done: 0, total: 0 };
      }
      const status = row.status.toLowerCase().replace(/\s+/g, '_') as keyof DistributionEntry;
      if (status in agentMap[agent] && status !== 'agent' && status !== 'total') {
        (agentMap[agent] as Record<string, number>)[status] = row.cnt;
      }
      agentMap[agent].total += row.cnt;
    }

    const distribution = Object.values(agentMap).sort((a, b) => b.total - a.total);

    // Find bottleneck: agent with most in_progress + pending
    let bottleneck = '';
    let maxLoad = 0;
    for (const entry of distribution) {
      const load = entry.pending + entry.in_progress;
      if (load > maxLoad) {
        maxLoad = load;
        bottleneck = entry.agent;
      }
    }

    // Queue totals
    const totals = distribution.reduce(
      (acc, e) => ({
        pending: acc.pending + e.pending,
        in_progress: acc.in_progress + e.in_progress,
        review: acc.review + e.review,
        done: acc.done + e.done,
        total: acc.total + e.total,
      }),
      { pending: 0, in_progress: 0, review: 0, done: 0, total: 0 }
    );

    return NextResponse.json({ distribution, bottleneck, totals });
  } catch (err) {
    console.error('[task-distribution]', err);
    return NextResponse.json({ distribution: [], bottleneck: '', totals: { pending: 0, in_progress: 0, review: 0, done: 0, total: 0 } });
  }
}
