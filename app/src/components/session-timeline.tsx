'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TimelineEntry {
  type: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'thinking';
  startMs: number;
  durationMs: number;
  label: string;
  detail: string;
}

interface TimelineData {
  entries: TimelineEntry[];
  summary: {
    totalMs: number;
    thinkingPct: number;
    toolPct: number;
    responsePct: number;
  };
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  user: { bg: 'bg-blue-600/30', border: 'border-blue-500', text: 'text-blue-400' },
  assistant: { bg: 'bg-green-600/30', border: 'border-green-500', text: 'text-green-400' },
  tool_call: { bg: 'bg-orange-600/30', border: 'border-orange-500', text: 'text-orange-400' },
  tool_result: { bg: 'bg-amber-600/30', border: 'border-amber-500', text: 'text-amber-400' },
  thinking: { bg: 'bg-purple-600/30', border: 'border-purple-500', text: 'text-purple-400' },
};

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

export function SessionTimeline({ sessionKey }: { sessionKey: string }) {
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/timeline?sessionKey=${encodeURIComponent(sessionKey)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setData(result);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom(z => Math.max(0.5, Math.min(10, z + (e.deltaY > 0 ? -0.2 : 0.2))));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  if (loading) return <div className="text-zinc-500 text-sm animate-pulse p-8 text-center">Loading timeline...</div>;
  if (error) return <div className="text-red-400 text-sm p-8 text-center">Error: {error}</div>;
  if (!data || data.entries.length === 0) return <div className="text-zinc-500 text-sm p-8 text-center">No timeline data</div>;

  const { entries, summary } = data;
  const totalMs = summary.totalMs || 1;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Time', value: formatMs(summary.totalMs), color: 'text-zinc-200' },
          { label: 'Thinking', value: `${summary.thinkingPct}%`, color: 'text-purple-400' },
          { label: 'Tools', value: `${summary.toolPct}%`, color: 'text-orange-400' },
          { label: 'Response', value: `${summary.responsePct}%`, color: 'text-green-400' },
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${colors.bg} border ${colors.border}`} />
            <span className="text-zinc-400 capitalize">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div ref={containerRef} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
        <div className="space-y-1" style={{ minWidth: `${Math.max(600, entries.length * 40 * zoom)}px` }}>
          {entries.map((entry, idx) => {
            const colors = TYPE_COLORS[entry.type] || TYPE_COLORS.assistant;
            const widthPct = Math.max(2, (entry.durationMs / totalMs) * 100 * zoom);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className="flex items-center gap-3 group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className={`w-20 text-right text-xs ${colors.text} font-mono shrink-0`}>
                  {formatMs(entry.durationMs)}
                </div>
                <div className="flex-1 relative">
                  <div
                    className={`h-7 rounded ${colors.bg} border ${colors.border} flex items-center px-2 transition-all ${isHovered ? 'brightness-125' : ''}`}
                    style={{ width: `${widthPct}%`, minWidth: '60px' }}
                  >
                    <span className="text-xs text-zinc-200 truncate">{entry.label}</span>
                  </div>
                  {isHovered && entry.detail && (
                    <div className="absolute z-50 top-8 left-0 bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-w-md shadow-xl">
                      <div className={`text-xs font-bold ${colors.text} mb-1`}>{entry.type.replace('_', ' ')} — {formatMs(entry.durationMs)}</div>
                      <p className="text-xs text-zinc-400 whitespace-pre-wrap">{entry.detail}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-zinc-600 mt-3 text-center">Ctrl/⌘ + Scroll to zoom</p>
      </div>
    </div>
  );
}
