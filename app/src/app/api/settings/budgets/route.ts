import { NextRequest, NextResponse } from 'next/server';

interface Budget {
  id: string;
  name: string;
  type: 'global' | 'agent';
  amount: number;
  spent: number;
  period: 'daily' | 'weekly';
  autoPause: boolean;
  alertThresholds: number[];
}

const budgets: Budget[] = [
  { id: 'global', name: 'Global Budget', type: 'global', amount: 50, spent: 37.42, period: 'daily', autoPause: false, alertThresholds: [80, 90, 100] },
  { id: 'agent-po', name: 'Po (Orchestrator)', type: 'agent', amount: 15, spent: 13.80, period: 'daily', autoPause: true, alertThresholds: [80, 90, 100] },
  { id: 'agent-coder', name: 'Coder', type: 'agent', amount: 12, spent: 8.40, period: 'daily', autoPause: true, alertThresholds: [80, 90, 100] },
  { id: 'agent-researcher', name: 'Researcher', type: 'agent', amount: 8, spent: 6.90, period: 'daily', autoPause: false, alertThresholds: [80, 90, 100] },
  { id: 'agent-reviewer', name: 'Reviewer', type: 'agent', amount: 5, spent: 2.10, period: 'daily', autoPause: true, alertThresholds: [80, 90, 100] },
  { id: 'agent-deployer', name: 'Deployer', type: 'agent', amount: 10, spent: 6.22, period: 'weekly', autoPause: false, alertThresholds: [80, 90, 100] },
];

export async function GET() {
  return NextResponse.json({ budgets });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, amount, period, autoPause } = body;
  const budget = budgets.find(b => b.id === id);
  if (!budget) {
    return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
  }
  if (amount !== undefined) budget.amount = amount;
  if (period !== undefined) budget.period = period;
  if (autoPause !== undefined) budget.autoPause = autoPause;
  return NextResponse.json({ budget });
}
