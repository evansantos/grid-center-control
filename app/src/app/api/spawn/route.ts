import { NextResponse } from 'next/server';
import { SpawnSchema, validateBody } from '@/lib/validators';

const AVAILABLE_AGENTS = [
  { id: 'arch', emoji: '🏛️', name: 'Arch' },
  { id: 'grid', emoji: '🔴', name: 'Grid' },
  { id: 'dev', emoji: '💻', name: 'Dev' },
  { id: 'bug', emoji: '🐛', name: 'Bug' },
  { id: 'vault', emoji: '🔐', name: 'Vault' },
  { id: 'atlas', emoji: '🗺️', name: 'Atlas' },
  { id: 'scribe', emoji: '📝', name: 'Scribe' },
  { id: 'pixel', emoji: '🎨', name: 'Pixel' },
  { id: 'sentinel', emoji: '🛡️', name: 'Sentinel' },
  { id: 'riff', emoji: '🎵', name: 'Riff' },
  { id: 'sage', emoji: '🧙', name: 'Sage' },
];

export async function GET() {
  return NextResponse.json({ agents: AVAILABLE_AGENTS });
}

export async function POST(request: Request) {
  const raw = await request.json();
  const validated = validateBody(SpawnSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { agentId, model, task, timeoutSeconds } = validated.data;

  console.log(`[SPAWN] Agent: ${agentId}, Model: ${model}, Timeout: ${timeoutSeconds}s, Task: ${task}`);

  // Placeholder — return mock response
  const mockSessionKey = `agent:${agentId}:subagent:${crypto.randomUUID()}`;

  return NextResponse.json({
    success: true,
    sessionKey: mockSessionKey,
    agentId,
    model: model || 'default',
    status: 'spawned',
    timestamp: new Date().toISOString(),
  });
}
