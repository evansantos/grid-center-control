import { NextRequest, NextResponse } from 'next/server';
import { AgentMessageSchema, validateBody } from '@/lib/validators';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = await req.json();
    const validated = validateBody(AgentMessageSchema, raw);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { message } = validated.data;

    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const { stdout, stderr } = await execFileAsync(
      'openclaw',
      ['message', 'send', '--agent', id, '--text', message],
      { timeout: 15000 }
    );

    return NextResponse.json({
      success: true,
      agent: id,
      message,
      response: stdout.trim(),
      ...(stderr ? { warning: stderr.trim() } : {}),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
