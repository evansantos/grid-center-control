import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Minimal environment to prevent env variable injection
const SAFE_ENV: Record<string, string> = {
  PATH: '/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin',
  HOME: process.env.HOME ?? '',
  LANG: 'en_US.UTF-8',
};

const MAX_AGENT_ID_LENGTH = 64;
const ALLOWED_ACTIONS = ['pause', 'resume', 'kill'] as const;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (!id || id.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    if (!ALLOWED_ACTIONS.includes(action)) {
      return NextResponse.json({ error: `Invalid action. Use: ${ALLOWED_ACTIONS.join(', ')}` }, { status: 400 });
    }

    const { stdout, stderr } = await execFileAsync(
      'openclaw',
      ['agent', action, id],
      { timeout: 15000, env: SAFE_ENV }
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
