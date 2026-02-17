import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { sessionKey, message } = body as { sessionKey: string; message: string };

  if (!sessionKey || !message) {
    return NextResponse.json({ error: 'sessionKey and message required' }, { status: 400 });
  }

  console.log(`[STEER] Session: ${sessionKey}, Message: ${message}`);

  // Placeholder — actual steering requires OpenClaw API integration
  return NextResponse.json({
    success: true,
    sessionKey,
    message: 'Steer request logged (placeholder)',
    timestamp: new Date().toISOString(),
  });
}
