import { NextRequest, NextResponse } from 'next/server';
import { ROICreateSchema, validateBody } from '@/lib/validators';

export interface ROIEntry {
  id: string;
  description: string;
  hoursSaved: number;
  hourlyRate: number;
  estimatedValue: number;
  aiCost: number;
  createdAt: string;
}

const entries: ROIEntry[] = [];

export async function GET() {
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const raw = await req.json();
  const validated = validateBody(ROICreateSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { description, hoursSaved, hourlyRate = 75, aiCost = 0 } = validated.data;

  const entry: ROIEntry = {
    id: crypto.randomUUID(),
    description,
    hoursSaved: Number(hoursSaved),
    hourlyRate: Number(hourlyRate),
    estimatedValue: Number(hoursSaved) * Number(hourlyRate),
    aiCost: Number(aiCost),
    createdAt: new Date().toISOString(),
  };

  entries.push(entry);
  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });

  entries.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
