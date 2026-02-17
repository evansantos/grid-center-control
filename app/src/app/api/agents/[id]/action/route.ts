import { NextRequest, NextResponse } from 'next/server';
import { AgentActionSchema, validateBody } from '@/lib/validators';

const MAX_AGENT_ID_LENGTH = 64;
const ALLOWED_ACTIONS = ['start', 'stop', 'restart', 'status'] as const;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || id.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
  }

  const raw = await request.json();
  const validated = validateBody(AgentActionSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { action, params: actionParams } = validated.data;

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
