import { NextResponse } from 'next/server';
import { getAgentStatuses } from '@/lib/agents';

export const dynamic = 'force-dynamic';

export async function GET() {
  const agents = await getAgentStatuses();

  const now = Date.now();
  let active = 0;
  let idle = 0;
  let offline = 0;

  for (const a of agents) {
    if (a.lastActivity && (now - new Date(a.lastActivity).getTime()) < 30_000) {
      active++;
    } else if (a.lastActivity) {
      idle++;
    } else {
      offline++;
    }
  }

  return NextResponse.json({
    agents,
    summary: { total: agents.length, active, idle, offline },
  });
}
