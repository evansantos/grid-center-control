import { NextResponse } from 'next/server';
import { getFullAgentInfo } from '@/lib/agents';

export async function GET() {
  try {
    const agents = await getFullAgentInfo();
    return NextResponse.json({ agents });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
