'use client';

import { useState } from 'react';

type TimeRange = '24h' | '7d' | '30d';

interface ModelData {
  name: string;
  latencyMs: number;
  costPer1k: number;
  qualityScore: number;
  totalRequests: number;
}

const DATA: Record<TimeRange, ModelData[]> = {
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

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-5 rounded-full overflow-hidden" style={{ background: 'var(--grid-bg)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export default function ModelComparisonPage() {
  const [range, setRange] = useState<TimeRange>('24h');
  const models = DATA[range];

  const maxLatency = Math.max(...models.map((m) => m.latencyMs));
  const maxCost = Math.max(...models.map((m) => m.costPer1k));
  const maxRequests = Math.max(...models.map((m) => m.totalRequests));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-wide mb-2" style={{ color: 'var(--grid-text)' }}>
            Model Comparison
          </h1>
          <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
            Compare latency, cost, and quality across models
          </p>
        </div>
        <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--grid-bg)' }}>
          {(['24h', '7d', '30d'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={{
                background: range === r ? 'var(--grid-accent)' : 'transparent',
                color: range === r ? '#fff' : 'var(--grid-text-dim)',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderColor: 'var(--grid-border)' }} className="border-b">
              {['Model', 'Avg Latency', 'Cost/1K tokens', 'Quality', 'Requests'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-medium"
                  style={{ color: 'var(--grid-text-dim)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr
                key={m.name}
                className="border-b last:border-b-0"
                style={{ borderColor: 'var(--grid-border)' }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--grid-text)' }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ background: COLORS[i] }}
                    />
                    {m.name}
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--grid-text)' }}>
                  {m.latencyMs} ms
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--grid-text)' }}>
                  ${m.costPer1k.toFixed(2)}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--grid-text)' }}>
                  {m.qualityScore}/100
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--grid-text)' }}>
                  {m.totalRequests.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Visual Bars */}
      {[
        { label: 'Latency (ms)', key: 'latencyMs' as const, max: maxLatency, fmt: (v: number) => `${v} ms` },
        { label: 'Cost per 1K tokens', key: 'costPer1k' as const, max: maxCost, fmt: (v: number) => `$${v.toFixed(2)}` },
        { label: 'Quality Score', key: 'qualityScore' as const, max: 100, fmt: (v: number) => `${v}/100` },
        { label: 'Total Requests', key: 'totalRequests' as const, max: maxRequests, fmt: (v: number) => v.toLocaleString() },
      ].map((metric) => (
        <div
          key={metric.label}
          className="p-4 rounded-lg border space-y-3"
          style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}
        >
          <h3 className="text-sm font-medium" style={{ color: 'var(--grid-text-dim)' }}>
            {metric.label}
          </h3>
          <div className="space-y-2">
            {models.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3">
                <span className="text-xs w-28 shrink-0" style={{ color: 'var(--grid-text)' }}>
                  {m.name}
                </span>
                <div className="flex-1">
                  <Bar value={m[metric.key]} max={metric.max} color={COLORS[i]} />
                </div>
                <span className="text-xs w-16 text-right shrink-0" style={{ color: 'var(--grid-text-dim)' }}>
                  {metric.fmt(m[metric.key])}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
