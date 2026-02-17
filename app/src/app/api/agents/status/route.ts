import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-error';
import { getAgentStatusMap } from '@/lib/agents';

export async function GET() {
  try {
    const status = await getAgentStatusMap();
    return NextResponse.json({ status });
  } catch (e: unknown) {
    return apiError(e);
  }
}
