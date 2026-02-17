import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { agentIds, action, payload } = await request.json();

  if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
    return NextResponse.json({ error: 'agentIds required' }, { status: 400 });
  }

  if (!['restart', 'broadcast', 'update-config'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Simulate bulk operation with realistic delays
  const results = agentIds.map((id: string) => {
    const success = Math.random() > 0.1; // 90% success rate
    const messages: Record<string, string> = {
      restart: success ? 'Agent restarted successfully' : 'Restart timed out',
      broadcast: success ? 'Message delivered' : 'Agent unreachable',
      'update-config': success ? 'Config updated' : 'Invalid config key',
    };
    return {
      agentId: id,
      success,
      message: messages[action],
    };
  });

  return NextResponse.json({
    action,
    total: agentIds.length,
    succeeded: results.filter((r: { success: boolean }) => r.success).length,
    failed: results.filter((r: { success: boolean }) => !r.success).length,
    payload: payload ?? null,
    results,
  });
}
