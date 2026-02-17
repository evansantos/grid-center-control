'use client';

import { useState, useEffect } from 'react';

interface Schedule {
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'color: #22c55e; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3)',
    failed: 'color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3)',
    pending: 'color: #eab308; background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3)',
  };
  return (
    <span
      className="font-mono text-xs px-2 py-0.5 rounded"
      style={{ cssText: colors[status] || '' }}
    >
      {status}
    </span>
  );
}

function Sparkline({ values, label, color = '#3b82f6' }: { values: number[]; label: string; color?: string }) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[--grid-text-dim] font-mono">{label}</span>
      <div className="flex items-end gap-[2px] h-10">
        {values.map((v, i) => {
          const height = Math.max(4, ((v - min) / range) * 36);
          return (
            <div
              key={i}
              title={`${v}`}
              style={{
                height: `${height}px`,
                width: `${Math.max(4, Math.floor(120 / values.length))}px`,
                background: color,
                opacity: 0.7 + (i / values.length) * 0.3,
                borderRadius: '2px 2px 0 0',
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-[--grid-text-dim] font-mono">
        <span>{min.toFixed(1)}</span>
        <span>{max.toFixed(1)}</span>
      </div>
    </div>
  );
}

export default function SnapshotsClient() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newDashboard, setNewDashboard] = useState('Main Overview');
  const [newNotify, setNewNotify] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/reports/snapshots');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules);
        setSnapshots(data.snapshots);
      }
    } catch (e) {
      console.error('Failed to fetch snapshots:', e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const generateNow = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/reports/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-now', dashboard: 'Main Overview' }),
      });
      if (res.ok) await fetchData();
    } catch (e) {
      console.error('Failed to generate snapshot:', e);
    }
    setGenerating(false);
  };

  const createSchedule = async () => {
    try {
      const res = await fetch('/api/reports/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-schedule',
          frequency: newFrequency,
          targetDashboard: newDashboard,
          notificationsEnabled: newNotify,
        }),
      });
      if (res.ok) {
        await fetchData();
        setShowNewSchedule(false);
      }
    } catch (e) {
      console.error('Failed to create schedule:', e);
    }
  };

  const completedSnapshots = snapshots.filter((s) => s.status === 'completed');
  const evolutionMetrics = {
    totalEvents: completedSnapshots.map((s) => s.metrics.totalEvents).reverse(),
    tasksCompleted: completedSnapshots.map((s) => s.metrics.tasksCompleted).reverse(),
    errorRate: completedSnapshots.map((s) => s.metrics.errorRate).reverse(),
    avgResponseTime: completedSnapshots.map((s) => s.metrics.avgResponseTime).reverse(),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[--grid-text-dim] font-mono">
        Loading snapshots...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Schedule Configuration */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[--grid-text] font-mono">Schedules</h2>
          <div className="flex gap-2">
            <button
              onClick={generateNow}
              disabled={generating}
              className="px-3 py-1.5 text-sm font-mono rounded border border-[--grid-border] text-[--grid-text] bg-[--grid-bg-elevated] hover:bg-[--grid-bg-hover] disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating...' : '⚡ Generate Now'}
            </button>
            <button
              onClick={() => setShowNewSchedule(!showNewSchedule)}
              className="px-3 py-1.5 text-sm font-mono rounded border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              + New Schedule
            </button>
          </div>
        </div>

        {showNewSchedule && (
          <div className="mb-4 p-4 rounded-lg border border-[--grid-border] bg-[--grid-bg-elevated]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-xs text-[--grid-text-dim] font-mono mb-1">Frequency</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  className="w-full px-2 py-1.5 text-sm font-mono rounded border border-[--grid-border] bg-[--grid-bg] text-[--grid-text]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[--grid-text-dim] font-mono mb-1">Target Dashboard</label>
                <select
                  value={newDashboard}
                  onChange={(e) => setNewDashboard(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm font-mono rounded border border-[--grid-border] bg-[--grid-bg] text-[--grid-text]"
                >
                  <option>Main Overview</option>
                  <option>Agent Performance</option>
                  <option>Project Status</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm font-mono text-[--grid-text]">
                  <input
                    type="checkbox"
                    checked={newNotify}
                    onChange={(e) => setNewNotify(e.target.checked)}
                    className="rounded"
                  />
                  Notify
                </label>
                <button
                  onClick={createSchedule}
                  className="ml-auto px-3 py-1.5 text-sm font-mono rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {schedules.map((sch) => (
            <div
              key={sch.id}
              className="p-3 rounded-lg border border-[--grid-border] bg-[--grid-bg-elevated]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-semibold text-[--grid-text]">
                  {sch.targetDashboard}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {sch.frequency}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-[--grid-text-dim] font-mono">
                <span>Next: {new Date(sch.nextRunAt).toLocaleString()}</span>
                <span>{sch.notificationsEnabled ? '🔔' : '🔕'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Evolution Charts */}
      <section>
        <h2 className="text-lg font-semibold text-[--grid-text] font-mono mb-4">Evolution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg border border-[--grid-border] bg-[--grid-bg-elevated]">
          <Sparkline values={evolutionMetrics.totalEvents} label="Total Events" color="#3b82f6" />
          <Sparkline values={evolutionMetrics.tasksCompleted} label="Tasks Completed" color="#22c55e" />
          <Sparkline values={evolutionMetrics.errorRate} label="Error Rate %" color="#ef4444" />
          <Sparkline values={evolutionMetrics.avgResponseTime} label="Avg Response (ms)" color="#eab308" />
        </div>
      </section>

      {/* Snapshot History */}
      <section>
        <h2 className="text-lg font-semibold text-[--grid-text] font-mono mb-4">
          History
          <span className="ml-2 text-xs text-[--grid-text-dim] font-normal">
            ({snapshots.length} snapshots)
          </span>
        </h2>
        <div className="flex flex-col gap-2">
          {snapshots.map((snap) => (
            <div
              key={snap.id}
              className="rounded-lg border border-[--grid-border] bg-[--grid-bg-elevated] overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === snap.id ? null : snap.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-[--grid-bg-hover] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[--grid-text-dim]">
                    {new Date(snap.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-mono text-[--grid-text]">{snap.dashboard}</span>
                  <StatusBadge status={snap.status} />
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[--grid-text-dim]">
                  {snap.status === 'completed' && (
                    <>
                      <span>{snap.metrics.totalEvents} events</span>
                      <span>{snap.metrics.tasksCompleted} tasks</span>
                    </>
                  )}
                  <span className="text-[--grid-text-dim]">
                    {expandedId === snap.id ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {expandedId === snap.id && snap.status === 'completed' && (
                <div className="px-4 pb-4 border-t border-[--grid-border]">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-3">
                    {[
                      { label: 'Total Events', value: snap.metrics.totalEvents.toLocaleString() },
                      { label: 'Tasks Completed', value: snap.metrics.tasksCompleted.toString() },
                      { label: 'Active Agents', value: snap.metrics.activeAgents.toString() },
                      { label: 'Error Rate', value: `${snap.metrics.errorRate.toFixed(1)}%` },
                      { label: 'Avg Response', value: `${snap.metrics.avgResponseTime}ms` },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <div className="text-lg font-mono font-semibold text-[--grid-text]">{m.value}</div>
                        <div className="text-[10px] font-mono text-[--grid-text-dim]">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedId === snap.id && snap.status === 'failed' && (
                <div className="px-4 pb-4 border-t border-[--grid-border]">
                  <p className="text-sm font-mono text-red-400 pt-3">
                    Snapshot generation failed. Dashboard may have been unavailable.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
