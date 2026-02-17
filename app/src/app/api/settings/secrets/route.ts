import { NextResponse } from 'next/server';

export interface SecretKey {
  id: string;
  name: string;
  provider: string;
  maskedKey: string;
  status: 'valid' | 'invalid' | 'rate-limited';
  agentsUsing: string[];
  lastUsed: string;
  created: string;
}

const mockKeys: SecretKey[] = [
  {
    id: '1',
    name: 'Production Claude',
    provider: 'Anthropic',
    maskedKey: '••••••••sk-a3f1',
    status: 'valid',
    agentsUsing: ['Po', 'Research Bot'],
    lastUsed: '2026-02-17T14:30:00Z',
    created: '2025-11-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'GPT-4o Main',
    provider: 'OpenAI',
    maskedKey: '••••••••x9Tk',
    status: 'valid',
    agentsUsing: ['Summarizer'],
    lastUsed: '2026-02-17T12:15:00Z',
    created: '2025-09-15T08:00:00Z',
  },
  {
    id: '3',
    name: 'Gemini Experimental',
    provider: 'Google',
    maskedKey: '••••••••Qm7e',
    status: 'rate-limited',
    agentsUsing: ['Vision Agent', 'Po'],
    lastUsed: '2026-02-16T22:00:00Z',
    created: '2026-01-10T12:00:00Z',
  },
  {
    id: '4',
    name: 'Voice Generation',
    provider: 'ElevenLabs',
    maskedKey: '••••••••vL2d',
    status: 'valid',
    agentsUsing: ['Po'],
    lastUsed: '2026-02-15T18:45:00Z',
    created: '2025-12-20T09:00:00Z',
  },
  {
    id: '5',
    name: 'Web Search',
    provider: 'Brave',
    maskedKey: '••••••••nR8w',
    status: 'invalid',
    agentsUsing: [],
    lastUsed: '2026-01-30T10:00:00Z',
    created: '2025-08-05T14:00:00Z',
  },
  {
    id: '6',
    name: 'Backup Claude Key',
    provider: 'Anthropic',
    maskedKey: '••••••••jP4c',
    status: 'valid',
    agentsUsing: ['Fallback Router'],
    lastUsed: '2026-02-10T06:20:00Z',
    created: '2026-01-25T11:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json({ keys: mockKeys });
}
