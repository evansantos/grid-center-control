import { NextRequest, NextResponse } from 'next/server';

export interface Budget {
  id: string;
  scope: 'global' | 'agent';
  agentName?: string;
  period: 'daily' | 'weekly';
  amount: number;
  alertThreshold: number;
  autoPause: boolean;
  currentSpend: number;
  createdAt: string;
}

const budgets: Budget[] = [
  {
    id: '1',
    scope: 'global',
    period: 'daily',
    amount: 50,
    alertThreshold: 80,
    autoPause: true,
    currentSpend: 37.5,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    scope: 'agent',
    agentName: 'po',
    period: 'weekly',
    amount: 200,
    alertThreshold: 90,
    autoPause: false,
    currentSpend: 145,
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const budget: Budget = {
    id: Date.now().toString(),
    scope: body.scope || 'global',
    agentName: body.agentName,
    period: body.period || 'daily',
    amount: body.amount || 0,
    alertThreshold: body.alertThreshold || 80,
    autoPause: body.autoPause ?? false,
    currentSpend: 0,
    createdAt: new Date().toISOString(),
  };
  budgets.push(budget);
  return NextResponse.json(budget, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const idx = budgets.findIndex((b) => b.id === body.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  budgets[idx] = { ...budgets[idx], ...body };
  return NextResponse.json(budgets[idx]);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const idx = budgets.findIndex((b) => b.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  budgets.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
