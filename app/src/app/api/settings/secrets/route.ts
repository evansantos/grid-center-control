import { NextRequest, NextResponse } from 'next/server';

export interface SecretKey {
  id: string;
  name: string;
  provider: string;
  maskedValue: string;
  agents: string[];
  status: 'active' | 'expiring' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
}

const sampleKeys: SecretKey[] = [
  {
    id: '1',
    name: 'Production GPT-4',
    provider: 'OpenAI',
    maskedValue: 'sk-...a3Xf',
    agents: ['summarizer', 'code-review', 'chat-agent'],
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z',
    expiresAt: '2026-07-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Claude Opus Key',
    provider: 'Anthropic',
    maskedValue: 'sk-ant-...q9Wz',
    agents: ['planner', 'architect'],
    status: 'active',
    createdAt: '2026-02-01T08:30:00Z',
    expiresAt: '2026-08-01T08:30:00Z',
  },
  {
    id: '3',
    name: 'Gemini Staging',
    provider: 'Google',
    maskedValue: 'AIza...mR7k',
    agents: ['research-bot'],
    status: 'expiring',
    createdAt: '2025-09-10T14:00:00Z',
    expiresAt: '2026-02-28T14:00:00Z',
  },
  {
    id: '4',
    name: 'Mistral Dev',
    provider: 'Mistral',
    maskedValue: 'ms-...pL2d',
    agents: [],
    status: 'expired',
    createdAt: '2025-06-01T12:00:00Z',
    expiresAt: '2026-01-01T12:00:00Z',
  },
  {
    id: '5',
    name: 'Legacy OpenAI',
    provider: 'OpenAI',
    maskedValue: 'sk-...nB4x',
    agents: ['legacy-bot'],
    status: 'revoked',
    createdAt: '2025-03-20T09:00:00Z',
    expiresAt: null,
  },
];

export async function GET() {
  return NextResponse.json(sampleKeys);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newKey: SecretKey = {
    id: crypto.randomUUID(),
    name: body.name,
    provider: body.provider,
    maskedValue: body.key ? body.key.slice(0, 4) + '...' + body.key.slice(-4) : 'sk-...????',
    agents: [],
    status: 'active',
    createdAt: new Date().toISOString(),
    expiresAt: null,
  };
  return NextResponse.json(newKey, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  return NextResponse.json({ id, status: 'revoked' });
}
