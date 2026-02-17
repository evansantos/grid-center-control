'use client';

import { useState, useEffect } from 'react';
import { formatCost, type CostSummary } from '@/lib/cost-calculator';

export default function CostsPage() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/costs?period=${period}`)
      .then(r => r.json())
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [period]);

  const statusColor = summary?.budgetStatus === 'critical' ? '#ef4444'
    : summary?.budgetStatus === 'warning' ? '#eab308' : '#22c55e';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-mono font-bold text-white">💰 Cost Dashboard</h1>
        <div className="flex gap-2">
          {(['daily', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-mono rounded-md border transition-colors ${
                period === p
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500 font-mono">Loading costs...</div>
      ) : !summary ? (
        <div className="text-center py-12 text-zinc-500 font-mono">No cost data available</div>
      ) : (
        <>
          {/* Total cost card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="text-sm font-mono text-zinc-500 mb-1">
              Total Cost ({period})
            </div>
            <div className="text-4xl font-mono font-bold" style={{ color: statusColor }}>
              {formatCost(summary.totalCost)}
            </div>
            <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(summary.budgetPercent, 100)}%`,
                  backgroundColor: statusColor,
                }}
              />
            </div>
            <div className="text-xs font-mono text-zinc-600 mt-1">
              {summary.budgetPercent.toFixed(1)}% of budget
            </div>
          </div>

          {/* By agent */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-sm font-mono font-bold text-zinc-400 mb-3">By Agent</h2>
            <div className="space-y-2">
              {Object.entries(summary.byAgent)
                .sort(([, a], [, b]) => b - a)
                .map(([agent, cost]) => (
                  <div key={agent} className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-300 uppercase">
                      {agent}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${(cost / summary.totalCost) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-400 w-16 text-right">
                        {formatCost(cost)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* By model */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-sm font-mono font-bold text-zinc-400 mb-3">By Model</h2>
            <div className="space-y-2">
              {Object.entries(summary.byModel)
                .sort(([, a], [, b]) => b - a)
                .map(([model, cost]) => (
                  <div key={model} className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-300">{model}</span>
                    <span className="text-xs font-mono text-zinc-400">{formatCost(cost)}</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
