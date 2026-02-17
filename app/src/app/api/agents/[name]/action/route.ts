import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const body = await request.json();
  const { action, params: actionParams } = body as { action: string; params?: Record<string, string> };

  return NextResponse.json({
    success: true,
    agent: name,
    action,
    params: actionParams ?? {},
    message: `Action queued: ${action}`,
  });
}
