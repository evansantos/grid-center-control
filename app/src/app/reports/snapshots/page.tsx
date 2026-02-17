'use client';

import { useState } from 'react';

/* ─── sample data ─── */
const SAMPLE_SNAPSHOTS = [
  { id: 's1', date: '2026-02-17T08:00:00Z', type: 'daily' as const, costs: 42.10, activity: 187, errors: 3, performance: 97.2 },
  { id: 's2', date: '2026-02-16T08:00:00Z', type: 'daily' as const, costs: 38.50, activity: 214, errors: 1, performance: 98.1 },
  { id: 's3', date: '2026-02-15T08:00:00Z', type: 'weekly' as const, costs: 275.30, activity: 1420, errors: 12, performance: 96.8 },
  { id: 's4', date: '2026-02-14T08:00:00Z', type: 'daily' as const, costs: 35.20, activity: 165, errors: 5, performance: 95.4 },
  { id: 's5', date: '2026-02-10T08:00:00Z', type: 'daily' as const, costs: 41.80, activity: 198, errors: 2, performance: 97.9 },
  { id: 's6', date: '2026-02-08T08:00:00Z', type: 'weekly' as const, costs: 290.60, activity: 1385, errors: 9, performance: 97.1 },
];

type Snapshot = (typeof SAMPLE_SNAPSHOTS)[number];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function SnapshotsPage() {
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [time, setTime] = useState('08:00');
  const [includes, setIncludes] = useState({ costs: true, activity: true, errors: true, performance: true });
  const [selected, setSelected] = useState<Snapshot | null>(null);

  const toggle = (key: keyof typeof includes) => setIncludes(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-2">Scheduled Snapshots</h1>
          <p className="text-[var(--grid-text-dim)] font-mono">Automated dashboard reports &amp; history</p>
        </div>

        {/* Schedule Config */}
        <div className="rounded-lg border border-[var(--grid-border)] bg-[var(--grid-surface)] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-mono font-semibold">Schedule Configuration</h2>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[var(--grid-accent)]' : 'bg-[var(--grid-border)]'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--grid-text-dim)] font-mono mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as 'daily' | 'weekly')}
                  className="w-full rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] text-[var(--grid-text)] px-3 py-2 font-mono text-sm"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--grid-text-dim)] font-mono mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] text-[var(--grid-text)] px-3 py-2 font-mono text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-[var(--grid-text-dim)] font-mono mb-2">Include in Snapshot</label>
                <div className="flex flex-wrap gap-4">
                  {(Object.keys(includes) as (keyof typeof includes)[]).map(key => (
                    <label key={key} className="flex items-center gap-2 text-sm font-mono cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includes[key]}
                        onChange={() => toggle(key)}
                        className="accent-[var(--grid-accent)]"
                      />
                      <span className="capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail View */}
        {selected && (
          <div className="rounded-lg border border-[var(--grid-accent)] bg-[var(--grid-surface)] p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-mono font-semibold">
                Snapshot — {fmtDate(selected.date)}
              </h2>
              <button onClick={() => setSelected(null)} className="text-[var(--grid-text-dim)] hover:text-[var(--grid-text)] font-mono text-sm">✕ Close</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Costs', value: `$${selected.costs.toFixed(2)}` },
                { label: 'Activity Events', value: String(selected.activity) },
                { label: 'Errors', value: String(selected.errors) },
                { label: 'Performance', value: `${selected.performance}%` },
              ].map(m => (
                <div key={m.label} className="rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] p-3 text-center">
                  <div className="text-xs text-[var(--grid-text-dim)] font-mono mb-1">{m.label}</div>
                  <div className="text-xl font-mono font-bold">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Snapshot History */}
        <div className="rounded-lg border border-[var(--grid-border)] bg-[var(--grid-surface)] p-5">
          <h2 className="text-lg font-mono font-semibold mb-4">Snapshot History</h2>
          <div className="space-y-2">
            {SAMPLE_SNAPSHOTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left rounded border px-4 py-3 font-mono text-sm transition-colors ${
                  selected?.id === s.id
                    ? 'border-[var(--grid-accent)] bg-[var(--grid-bg)]'
                    : 'border-[var(--grid-border)] bg-[var(--grid-bg)] hover:border-[var(--grid-accent)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold uppercase ${
                      s.type === 'weekly' ? 'bg-[var(--grid-accent)]/20 text-[var(--grid-accent)]' : 'bg-[var(--grid-border)] text-[var(--grid-text-dim)]'
                    }`}>{s.type}</span>
                    <span>{fmtDate(s.date)}</span>
                  </div>
                  <div className="flex gap-4 text-[var(--grid-text-dim)] text-xs">
                    <span>${s.costs.toFixed(2)}</span>
                    <span>{s.activity} events</span>
                    <span>{s.errors} errors</span>
                    <span>{s.performance}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
