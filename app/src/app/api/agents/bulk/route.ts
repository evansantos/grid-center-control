import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentIds, action, payload } = body as {
    agentIds: string[];
    action: string;
    payload?: Record<string, unknown>;
  };

  if (!agentIds?.length || !action) {
    return NextResponse.json({ error: 'agentIds and action are required' }, { status: 400 });
  }

  // Mock results
  const results = agentIds.map((id) => ({
    agentId: id,
    success: true,
    message:
      action === 'restart'
        ? 'Restarted successfully'
        : action === 'broadcast'
        ? `Message delivered: "${payload?.message ?? ''}"`
        : 'Config updated',
  }));

  return NextResponse.json({ ok: true, action, results });
}
