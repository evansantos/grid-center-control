'use client';

import { useEffect, useState } from 'react';

interface DistributionEntry {
  agent: string;
  pending: number;
  in_progress: number;
  review: number;
  done: number;
  total: number;
}

interface DistributionData {
  distribution: DistributionEntry[];
  bottleneck: string;
  totals: { pending: number; in_progress: number; review: number; done: number; total: number };
}

const STATUS_COLS = [
  { key: 'pending' as const, label: 'Pending', color: 'var(--grid-text-muted, #6b7280)' },
  { key: 'in_progress' as const, label: 'Active', color: 'var(--grid-accent, #3b82f6)' },
  { key: 'review' as const, label: 'Review', color: '#e5a00d' },
  { key: 'done' as const, label: 'Done', color: '#22c55e' },
];

function heatBg(count: number, max: number): string {
  if (max === 0 || count === 0) return 'transparent';
  const intensity = Math.min(count / Math.max(max, 1), 1);
  return `rgba(59, 130, 246, ${0.08 + intensity * 0.35})`;
}

function Skeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-6 rounded" style={{ background: 'var(--grid-bg)' }} />
      ))}
    </div>
  );
}

function agentLabel(agent: string): string {
  if (!agent || agent === 'unassigned') return 'Unassigned';
  // Extract agent name from session string like "agent:pixel:..."
  const parts = agent.split(':');
  if (parts.length >= 2) return parts[1].toUpperCase();
  return agent.toUpperCase();
}

export function TaskDistributionWidget() {
  const [data, setData] = useState<DistributionData | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch('/api/task-distribution')
        .then((r) => r.json())
        .then((d) => active && setData(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 15_000);
    return () => { active = false; clearInterval(id); };
  }, []);

  if (!data) return <Skeleton />;

  const { distribution, bottleneck, totals } = data;
  const maxCell = Math.max(
    ...distribution.flatMap((e) => [e.pending, e.in_progress, e.review, e.done]),
    1
  );

  return (
    <div className="space-y-3">
      {/* Queue depth indicators */}
      <div className="flex items-center gap-3 flex-wrap">
        {STATUS_COLS.map((col) => (
          <div key={col.key} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: col.color }}
            />
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--grid-text-muted)' }}
            >
              {col.label}
            </span>
            <span
              className="text-xs font-bold font-mono"
              style={{ color: 'var(--grid-text)' }}
            >
              {totals[col.key]}
            </span>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      {distribution.length === 0 ? (
        <p className="text-xs font-mono" style={{ color: 'var(--grid-text-dim)' }}>
          No task data available
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th
                  className="text-left py-1 pr-3 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--grid-text-dim)', fontSize: '0.65rem' }}
                >
                  Agent
                </th>
                {STATUS_COLS.map((col) => (
                  <th
                    key={col.key}
                    className="text-center px-2 py-1 font-semibold uppercase tracking-wider"
                    style={{ color: col.color, fontSize: '0.65rem' }}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  className="text-center px-2 py-1 font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--grid-text-dim)', fontSize: '0.65rem' }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {distribution.map((entry) => {
                const isBottleneck = entry.agent === bottleneck && (entry.pending + entry.in_progress) > 0;
                return (
                  <tr
                    key={entry.agent}
                    className={isBottleneck ? 'ring-1 ring-amber-500/40 rounded' : ''}
                  >
                    <td
                      className="py-1.5 pr-3 font-semibold whitespace-nowrap"
                      style={{ color: isBottleneck ? '#f59e0b' : 'var(--grid-text)' }}
                    >
                      {isBottleneck && (
                        <span className="mr-1" title="Bottleneck — highest active load">⚠</span>
                      )}
                      {agentLabel(entry.agent)}
                    </td>
                    {STATUS_COLS.map((col) => {
                      const val = entry[col.key];
                      return (
                        <td
                          key={col.key}
                          className="text-center px-2 py-1.5 rounded"
                          style={{
                            background: heatBg(val, maxCell),
                            color: val > 0 ? 'var(--grid-text)' : 'var(--grid-text-dim)',
                            fontWeight: val > 0 ? 700 : 400,
                          }}
                        >
                          {val}
                        </td>
                      );
                    })}
                    <td
                      className="text-center px-2 py-1.5 font-bold"
                      style={{ color: 'var(--grid-text-muted)' }}
                    >
                      {entry.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
