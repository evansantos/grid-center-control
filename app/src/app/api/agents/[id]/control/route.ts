import { NextRequest, NextResponse } from 'next/server';
import { AgentControlSchema, validateBody } from '@/lib/validators';
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
    const raw = await req.json();
    const validated = validateBody(AgentControlSchema, raw);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { action } = validated.data;

    if (!id || id.length > MAX_AGENT_ID_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid agent ID' }, { status: 400 });
    }

    const { stdout, stderr } = await execFileAsync(
      'openclaw',
      ['agent', action, id],
      { timeout: 15000, env: SAFE_ENV as NodeJS.ProcessEnv }
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
