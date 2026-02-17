import { NextRequest, NextResponse } from 'next/server';

const MAX_AGENT_ID_LENGTH = 64;
const ALLOWED_ACTIONS = ['start', 'stop', 'restart', 'status'] as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || id.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
  }

  const body = await request.json();
  const { action, params: actionParams } = body as { action: string; params?: Record<string, string> };

  if (!action || typeof action !== 'string' || action.length > 64) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    agent: id,
    action,
    params: actionParams ?? {},
    message: `Action queued: ${action}`,
  });
}
