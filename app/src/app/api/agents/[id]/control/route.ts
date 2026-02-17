import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    if (!['pause', 'resume', 'kill'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use: pause, resume, kill' }, { status: 400 });
    }

    const { stdout, stderr } = await execFileAsync(
      'openclaw',
      ['agent', action, id],
      { timeout: 15000 }
    );

    return NextResponse.json({
      success: true,
      agent: id,
      action,
      output: stdout.trim(),
      ...(stderr ? { warning: stderr.trim() } : {}),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
