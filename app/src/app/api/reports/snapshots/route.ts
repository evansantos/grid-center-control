import { NextRequest, NextResponse } from 'next/server';

const snapshots = [
  { id: 's1', date: '2026-02-17T08:00:00Z', type: 'daily', costs: 42.10, activity: 187, errors: 3, performance: 97.2 },
  { id: 's2', date: '2026-02-16T08:00:00Z', type: 'daily', costs: 38.50, activity: 214, errors: 1, performance: 98.1 },
  { id: 's3', date: '2026-02-15T08:00:00Z', type: 'weekly', costs: 275.30, activity: 1420, errors: 12, performance: 96.8 },
  { id: 's4', date: '2026-02-14T08:00:00Z', type: 'daily', costs: 35.20, activity: 165, errors: 5, performance: 95.4 },
  { id: 's5', date: '2026-02-10T08:00:00Z', type: 'daily', costs: 41.80, activity: 198, errors: 2, performance: 97.9 },
  { id: 's6', date: '2026-02-08T08:00:00Z', type: 'weekly', costs: 290.60, activity: 1385, errors: 9, performance: 97.1 },
];

let config = { enabled: true, frequency: 'daily', time: '08:00', includes: { costs: true, activity: true, errors: true, performance: true } };

export async function GET() {
  return NextResponse.json({ snapshots, config });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newSnapshot = { id: `s${Date.now()}`, date: new Date().toISOString(), type: config.frequency, ...body };
  snapshots.unshift(newSnapshot);
  return NextResponse.json(newSnapshot, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  config = { ...config, ...body };
  return NextResponse.json(config);
}
