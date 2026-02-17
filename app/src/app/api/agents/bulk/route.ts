import { NextRequest, NextResponse } from 'next/server';
import { BulkActionSchema, validateBody } from '@/lib/validators';

export async function POST(request: NextRequest) {
  const raw = await request.json();
  const validated = validateBody(BulkActionSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { agentIds, action, payload } = validated.data;

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
