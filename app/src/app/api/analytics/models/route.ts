import { NextRequest, NextResponse } from 'next/server';

const DATA: Record<string, Array<{
  name: string;
  latencyMs: number;
  costPer1k: number;
  qualityScore: number;
  totalRequests: number;
}>> = {
  '24h': [
    { name: 'gpt-4o', latencyMs: 820, costPer1k: 2.50, qualityScore: 92, totalRequests: 1243 },
    { name: 'claude-opus-4', latencyMs: 950, costPer1k: 3.00, qualityScore: 95, totalRequests: 876 },
    { name: 'claude-sonnet-4', latencyMs: 480, costPer1k: 0.80, qualityScore: 89, totalRequests: 2105 },
    { name: 'gpt-4o-mini', latencyMs: 310, costPer1k: 0.15, qualityScore: 78, totalRequests: 3420 },
    { name: 'deepseek-r1', latencyMs: 1200, costPer1k: 0.55, qualityScore: 86, totalRequests: 654 },
  ],
  '7d': [
    { name: 'gpt-4o', latencyMs: 790, costPer1k: 2.50, qualityScore: 91, totalRequests: 8730 },
    { name: 'claude-opus-4', latencyMs: 920, costPer1k: 3.00, qualityScore: 94, totalRequests: 5940 },
    { name: 'claude-sonnet-4', latencyMs: 510, costPer1k: 0.80, qualityScore: 88, totalRequests: 14280 },
    { name: 'gpt-4o-mini', latencyMs: 290, costPer1k: 0.15, qualityScore: 77, totalRequests: 24100 },
    { name: 'deepseek-r1', latencyMs: 1150, costPer1k: 0.55, qualityScore: 85, totalRequests: 4320 },
  ],
  '30d': [
    { name: 'gpt-4o', latencyMs: 810, costPer1k: 2.50, qualityScore: 91, totalRequests: 35200 },
    { name: 'claude-opus-4', latencyMs: 940, costPer1k: 3.00, qualityScore: 95, totalRequests: 24100 },
    { name: 'claude-sonnet-4', latencyMs: 500, costPer1k: 0.80, qualityScore: 89, totalRequests: 58700 },
    { name: 'gpt-4o-mini', latencyMs: 300, costPer1k: 0.15, qualityScore: 78, totalRequests: 102400 },
    { name: 'deepseek-r1', latencyMs: 1180, costPer1k: 0.55, qualityScore: 86, totalRequests: 18600 },
  ],
};

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') ?? '24h';
  const models = DATA[range] ?? DATA['24h'];
  return NextResponse.json({ range, models });
}
