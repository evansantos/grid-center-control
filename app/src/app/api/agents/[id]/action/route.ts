import { NextRequest, NextResponse } from 'next/server';
import { AgentActionSchema, validateBody } from '@/lib/validators';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
  }

  const raw = await request.json();
  const validated = validateBody(AgentActionSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { action, params: actionParams } = validated.data;

  return NextResponse.json({
    success: true,
    agent: id,
    action,
    params: actionParams ?? {},
    message: `Action queued: ${action}`,
  });
}
