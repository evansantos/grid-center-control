import { NextRequest, NextResponse } from 'next/server';
import { SnapshotActionSchema, validateBody } from '@/lib/validators';

interface SnapshotSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDashboard: string;
  notificationsEnabled: boolean;
  createdAt: string;
  nextRunAt: string;
}

interface Snapshot {
  id: string;
  scheduleId: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'pending';
  dashboard: string;
  metrics: {
    totalEvents: number;
    tasksCompleted: number;
    activeAgents: number;
    errorRate: number;
    avgResponseTime: number;
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const schedules: SnapshotSchedule[] = [
  {
    id: 'sch-1',
    frequency: 'daily',
    targetDashboard: 'Main Overview',
    notificationsEnabled: true,
    createdAt: daysAgo(30),
    nextRunAt: new Date(Date.now() + 3600000).toISOString(),
  },
  {
    id: 'sch-2',
    frequency: 'weekly',
    targetDashboard: 'Agent Performance',
    notificationsEnabled: false,
    createdAt: daysAgo(14),
    nextRunAt: new Date(Date.now() + 86400000 * 3).toISOString(),
  },
];

const snapshots: Snapshot[] = Array.from({ length: 14 }, (_, i) => ({
  id: `snap-${i + 1}`,
  scheduleId: i % 3 === 0 ? 'sch-2' : 'sch-1',
  createdAt: daysAgo(i),
  status: i === 5 ? 'failed' : 'completed',
  dashboard: i % 3 === 0 ? 'Agent Performance' : 'Main Overview',
  metrics: {
    totalEvents: 1200 + Math.floor(Math.sin(i * 0.5) * 300) + i * 20,
    tasksCompleted: 45 + Math.floor(Math.cos(i * 0.3) * 15) + i * 2,
    activeAgents: 3 + (i % 3),
    errorRate: Math.max(0, 2.5 + Math.sin(i * 0.7) * 2),
    avgResponseTime: 120 + Math.floor(Math.sin(i * 0.4) * 40),
  },
}));

export async function GET() {
  return NextResponse.json({ schedules, snapshots });
}

export async function POST(request: NextRequest) {
  const raw = await request.json();
  const validated = validateBody(SnapshotActionSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const body = validated.data;
  const { action } = body;

  if (action === 'create-schedule') {
    const newSchedule: SnapshotSchedule = {
      id: `sch-${Date.now()}`,
      frequency: body.frequency || 'daily',
      targetDashboard: body.targetDashboard || 'Main Overview',
      notificationsEnabled: body.notificationsEnabled ?? true,
      createdAt: new Date().toISOString(),
      nextRunAt: new Date(Date.now() + 86400000).toISOString(),
    };
    schedules.push(newSchedule);
    return NextResponse.json(newSchedule, { status: 201 });
  }

  if (action === 'generate-now') {
    const newSnapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      scheduleId: 'manual',
      createdAt: new Date().toISOString(),
      status: 'completed',
      dashboard: body.dashboard || 'Main Overview',
      metrics: {
        totalEvents: 1350 + Math.floor(Math.random() * 200),
        tasksCompleted: 52 + Math.floor(Math.random() * 20),
        activeAgents: 3 + Math.floor(Math.random() * 3),
        errorRate: Math.round((1.5 + Math.random() * 3) * 10) / 10,
        avgResponseTime: 100 + Math.floor(Math.random() * 80),
      },
    };
    snapshots.unshift(newSnapshot);
    return NextResponse.json(newSnapshot, { status: 201 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
