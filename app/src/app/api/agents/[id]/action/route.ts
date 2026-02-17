import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
  }

  const body = await request.json();
  const { action, params: actionParams } = body as { action: string; params?: Record<string, string> };

  return NextResponse.json({
    success: true,
    agent: id,
    action,
    params: actionParams ?? {},
    message: `Action queued: ${action}`,
  });
}
