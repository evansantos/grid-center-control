import { NextResponse } from 'next/server';
import { SteerSchema, validateBody } from '@/lib/validators';

export async function POST(request: Request) {
  const raw = await request.json();
  const validated = validateBody(SteerSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { sessionKey, message } = validated.data;

  console.log(`[STEER] Session: ${sessionKey}, Message: ${message}`);

  // Placeholder — actual steering requires OpenClaw API integration
  return NextResponse.json({
    success: true,
    sessionKey,
    message: 'Steer request logged (placeholder)',
    timestamp: new Date().toISOString(),
  });
}
