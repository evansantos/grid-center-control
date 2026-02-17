import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    let command: string;
    switch (action) {
      case 'pause':
        command = `openclaw agent pause ${id}`;
        break;
      case 'resume':
        command = `openclaw agent resume ${id}`;
        break;
      case 'kill':
        command = `openclaw agent kill ${id}`;
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const { stdout, stderr } = await execAsync(command, { timeout: 15000 });

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
