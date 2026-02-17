import { NextRequest, NextResponse } from 'next/server';

const HOURLY_RATE = 75;

interface ManualEntry {
  id: string;
  agent: string;
  description: string;
  timeSavedMin: number;
  date: string;
}

interface AgentROI {
  agent: string;
  cost: number;
  tasksCompleted: number;
  timeSavedHrs: number;
  hourlyRate: number;
  valueGenerated: number;
}

const agentData: AgentROI[] = [
  { agent: 'Po (Orchestrator)', cost: 42.30, tasksCompleted: 156, timeSavedHrs: 18.5, hourlyRate: HOURLY_RATE, valueGenerated: 1387.50 },
  { agent: 'Coder', cost: 38.10, tasksCompleted: 89, timeSavedHrs: 32.0, hourlyRate: HOURLY_RATE, valueGenerated: 2400.00 },
  { agent: 'Researcher', cost: 21.40, tasksCompleted: 45, timeSavedHrs: 12.0, hourlyRate: HOURLY_RATE, valueGenerated: 900.00 },
  { agent: 'Reviewer', cost: 8.90, tasksCompleted: 67, timeSavedHrs: 8.5, hourlyRate: HOURLY_RATE, valueGenerated: 637.50 },
  { agent: 'Deployer', cost: 6.22, tasksCompleted: 23, timeSavedHrs: 5.0, hourlyRate: HOURLY_RATE, valueGenerated: 375.00 },
];

const manualEntries: ManualEntry[] = [
  { id: '1', agent: 'Coder', description: 'Refactored auth module', timeSavedMin: 120, date: '2026-02-17' },
  { id: '2', agent: 'Researcher', description: 'API comparison report', timeSavedMin: 90, date: '2026-02-16' },
];

export async function GET() {
  const totalCost = agentData.reduce((s, a) => s + a.cost, 0);
  const totalTimeSaved = agentData.reduce((s, a) => s + a.timeSavedHrs, 0);
  const totalValue = agentData.reduce((s, a) => s + a.valueGenerated, 0);
  const roiMultiplier = totalCost > 0 ? totalValue / totalCost : 0;

  return NextResponse.json({
    summary: { totalCost, totalTimeSaved, totalValue, netValue: totalValue - totalCost, roiMultiplier },
    agents: agentData,
    manualEntries,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agent, description, timeSavedMin, date } = body;
  const entry: ManualEntry = {
    id: String(Date.now()),
    agent,
    description,
    timeSavedMin,
    date: date || new Date().toISOString().split('T')[0],
  };
  manualEntries.push(entry);
  return NextResponse.json({ entry }, { status: 201 });
}
