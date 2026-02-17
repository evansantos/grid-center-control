'use client';

import { useState, useEffect } from 'react';

interface HeatmapDay {
  date: string;
  count: number;
}

interface SessionStats {
  totalSessions: number;
  busiestDay: { date: string; count: number };
  avgPerDay: number;
  currentStreak: number;
  peakHours: number[];
}

const COLORS = [
  'bg-zinc-800/50',    // 0
  'bg-green-900/70',   // 1-3
  'bg-green-700/70',   // 4-7
  'bg-green-500/70',   // 8+
  'bg-green-400',      // 12+
];

function getColor(count: number): string {
  if (count === 0) return COLORS[0];
  if (count <= 3) return COLORS[1];
  if (count <= 7) return COLORS[2];
  if (count <= 11) return COLORS[3];
  return COLORS[4];
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

  // Pad to full weeks (52×7 = 364 days)
  const padded = [...Array(364 - heatmap.length).fill({ date: '', count: 0 }), ...heatmap];

  // Build weeks grid
  const weeks: HeatmapDay[][] = [];
  for (let w = 0; w < 52; w++) {
    weeks.push(padded.slice(w * 7, w * 7 + 7));
  }

  const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

  return (
    <div className="space-y-6">
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

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Sessions', value: String(stats.totalSessions) },
            { label: 'Busiest Day', value: stats.busiestDay.date ? `${stats.busiestDay.date} (${stats.busiestDay.count})` : 'N/A' },
            { label: 'Avg / Day', value: String(stats.avgPerDay) },
            { label: 'Current Streak', value: `${stats.currentStreak} days` },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
              <div className="text-lg font-mono text-zinc-200">{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
