import { NextRequest, NextResponse } from 'next/server';

const modelStats: Record<string, Array<{
  name: string; avgLatency: number; costPer1k: number;
  qualityScore: number; totalRequests: number; errorRate: number;
}>> = {
  '24h': [
    { name: 'claude-opus-4-20250514', avgLatency: 1850, costPer1k: 0.06, qualityScore: 98, totalRequests: 1240, errorRate: 0.3 },
    { name: 'claude-sonnet-4-20250514', avgLatency: 680, costPer1k: 0.012, qualityScore: 92, totalRequests: 8920, errorRate: 0.5 },
    { name: 'gpt-4o', avgLatency: 920, costPer1k: 0.025, qualityScore: 91, totalRequests: 6340, errorRate: 0.8 },
    { name: 'gpt-4o-mini', avgLatency: 310, costPer1k: 0.002, qualityScore: 78, totalRequests: 15200, errorRate: 1.2 },
    { name: 'gemini-2.0-flash', avgLatency: 240, costPer1k: 0.001, qualityScore: 74, totalRequests: 12800, errorRate: 1.5 },
  ],
  '7d': [
    { name: 'claude-opus-4-20250514', avgLatency: 1920, costPer1k: 0.06, qualityScore: 97, totalRequests: 8200, errorRate: 0.4 },
    { name: 'claude-sonnet-4-20250514', avgLatency: 710, costPer1k: 0.012, qualityScore: 93, totalRequests: 58400, errorRate: 0.6 },
    { name: 'gpt-4o', avgLatency: 880, costPer1k: 0.025, qualityScore: 90, totalRequests: 42100, errorRate: 0.9 },
    { name: 'gpt-4o-mini', avgLatency: 290, costPer1k: 0.002, qualityScore: 76, totalRequests: 104000, errorRate: 1.4 },
    { name: 'gemini-2.0-flash', avgLatency: 260, costPer1k: 0.001, qualityScore: 72, totalRequests: 89500, errorRate: 1.8 },
  ],
  '30d': [
    { name: 'claude-opus-4-20250514', avgLatency: 1980, costPer1k: 0.06, qualityScore: 97, totalRequests: 34500, errorRate: 0.5 },
    { name: 'claude-sonnet-4-20250514', avgLatency: 720, costPer1k: 0.012, qualityScore: 92, totalRequests: 248000, errorRate: 0.7 },
    { name: 'gpt-4o', avgLatency: 900, costPer1k: 0.025, qualityScore: 90, totalRequests: 182000, errorRate: 1.0 },
    { name: 'gpt-4o-mini', avgLatency: 305, costPer1k: 0.002, qualityScore: 75, totalRequests: 445000, errorRate: 1.5 },
    { name: 'gemini-2.0-flash', avgLatency: 250, costPer1k: 0.001, qualityScore: 70, totalRequests: 380000, errorRate: 2.0 },
  ],
};

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range') || '24h';
  const data = modelStats[range] || modelStats['24h'];
  return NextResponse.json({ models: data, range });
}
