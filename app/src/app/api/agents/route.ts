import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-error';
import { getFullAgentInfo } from '@/lib/agents';

export async function GET() {
  try {
    const agents = await getFullAgentInfo();
    return NextResponse.json({ agents });
  } catch (e: unknown) {
    return apiError(e);
  }
}
