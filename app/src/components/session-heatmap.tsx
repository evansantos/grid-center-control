'use client';

import { useState, useEffect } from 'react';

interface HeatmapDay {
  date: string;
  count: number;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  deletedSessions: number;
  busiestDay: { date: string; count: number };
  avgPerDay: number;
  currentStreak: number;
  peakHours: number[];
  agentBreakdown: { agentId: string; count: number }[];
  modelBreakdown: { model: string; count: number }[];
  totalTokensIn: number;
  totalTokensOut: number;
  avgSessionDurationSec: number;
}

const COLORS = [
  'bg-zinc-800/50',
  'bg-green-900/70',
  'bg-green-700/70',
  'bg-green-500/70',
  'bg-green-400',
];

function getColor(count: number): string {
  if (count === 0) return COLORS[0];
  if (count <= 3) return COLORS[1];
  if (count <= 7) return COLORS[2];
  if (count <= 11) return COLORS[3];
  return COLORS[4];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
}

export function SessionHeatmap() {
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch('/api/analytics/sessions')
      .then(r => r.json())
      .then(d => { setHeatmap(d.heatmap || []); setStats(d.stats || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-500 text-sm animate-pulse">Loading session data...</div>;

  const padded = [...Array(Math.max(0, 364 - heatmap.length)).fill({ date: '', count: 0 }), ...heatmap];
  const weeks: HeatmapDay[][] = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(padded.slice(w * 7, w * 7 + 7));
  }
  const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 overflow-x-auto relative">
        <div className="flex gap-0.5">
          <div className="flex flex-col gap-0.5 mr-2 text-[10px] text-zinc-600 pt-0">
            {DAYS.map((d, i) => <div key={i} className="h-[13px] flex items-center">{d}</div>)}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-[13px] h-[13px] rounded-sm ${getColor(day.count)} cursor-pointer hover:ring-1 hover:ring-zinc-500 transition-all`}
                  onMouseEnter={(e) => {
                    if (day.date) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ date: day.date, count: day.count, x: rect.left, y: rect.top - 40 });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {tooltip && (
          <div
            className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 pointer-events-none shadow-lg"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <span className="font-mono">{tooltip.count}</span> sessions on <span className="text-zinc-400">{tooltip.date}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 text-[10px] text-zinc-500">
          <span>Less</span>
          {COLORS.map((c, i) => <div key={i} className={`w-[13px] h-[13px] rounded-sm ${c}`} />)}
          <span>More</span>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions', value: String(stats.totalSessions) },
              { label: 'Active / Deleted', value: `${stats.activeSessions} / ${stats.deletedSessions}` },
              { label: 'Busiest Day', value: stats.busiestDay.date ? `${stats.busiestDay.date} (${stats.busiestDay.count})` : 'N/A' },
              { label: 'Current Streak', value: `${stats.currentStreak} days` },
              { label: 'Avg / Day', value: String(stats.avgPerDay) },
              { label: 'Avg Duration', value: formatDuration(stats.avgSessionDurationSec) },
              { label: 'Tokens In', value: formatTokens(stats.totalTokensIn) },
              { label: 'Tokens Out', value: formatTokens(stats.totalTokensOut) },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
                <div className="text-lg font-mono text-zinc-200">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Agent Breakdown */}
          {stats.agentBreakdown.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Sessions by Agent</h3>
              <div className="space-y-2">
                {stats.agentBreakdown.map(({ agentId, count }) => {
                  const maxCount = stats.agentBreakdown[0]?.count || 1;
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={agentId} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400 w-16 text-right capitalize">{agentId}</span>
                      <div className="flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
                        <div
                          className="h-full rounded bg-green-600/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-300 w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Model Breakdown */}
          {stats.modelBreakdown && stats.modelBreakdown.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Sessions by Model</h3>
              <div className="space-y-2">
                {stats.modelBreakdown.map(({ model, count }) => {
                  const maxCount = stats.modelBreakdown[0]?.count || 1;
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={model} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400 w-36 text-right font-mono truncate">{model}</span>
                      <div className="flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
                        <div
                          className="h-full rounded bg-purple-600/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-zinc-300 w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Peak Hours */}
          {stats.peakHours.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Peak Hours (UTC)</h3>
              <div className="flex gap-2 flex-wrap">
                {stats.peakHours.map((h, i) => (
                  <span key={i} className="px-3 py-1.5 bg-zinc-800 rounded text-xs font-mono text-zinc-300">
                    {String(h).padStart(2, '0')}:00
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
