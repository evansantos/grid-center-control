import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

const MAX_OUTPUT = 10 * 1024; // 10KB
const TIMEOUT_MS = 10_000; // 10s

const BLOCKED = ['rm -rf /', 'mkfs', 'dd if=', ':(){', 'fork bomb'];

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ error: 'No command provided' }, { status: 400 });
    }

    const cmd = command.trim();
    if (BLOCKED.some(b => cmd.includes(b))) {
      return NextResponse.json({ error: 'Command blocked for safety' }, { status: 403 });
    }

    try {
      const result = execSync(cmd, {
        timeout: TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: '/bin/zsh',
      });

      return NextResponse.json({ output: result.slice(0, MAX_OUTPUT) });
    } catch (e: any) {
      const output = (e.stdout ?? '') + (e.stderr ?? '');
      if (e.killed) {
        return NextResponse.json({ output: output.slice(0, MAX_OUTPUT), error: 'Command timed out (10s limit)' });
      }
      return NextResponse.json({ output: output.slice(0, MAX_OUTPUT) || e.message });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
