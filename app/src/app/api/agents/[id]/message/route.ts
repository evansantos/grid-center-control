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
const MAX_MESSAGE_LENGTH = 10000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)` }, { status: 400 });
    }

    if (!id || id.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const { stdout, stderr } = await execFileAsync(
      'openclaw',
      ['message', 'send', '--agent', id, '--text', message],
      { timeout: 15000, env: SAFE_ENV as NodeJS.ProcessEnv }
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
