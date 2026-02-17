import { NextResponse } from 'next/server';
import { getAgentStatusMap } from '@/lib/agents';

export async function GET() {
  try {
    const status = await getAgentStatusMap();
    return NextResponse.json({ status });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
