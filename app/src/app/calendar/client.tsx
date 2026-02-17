'use client';

import { useState, useEffect, useCallback } from 'react';

interface CalendarEntry {
  date: string;
  agents: string[];
  size: number;
  previews: Record<string, string>;
}

const AGENT_COLORS = ['var(--grid-accent)', '#e879f9', '#34d399', '#f59e0b', '#60a5fa', '#f87171'];

function getMonthStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday-based
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function ActivityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayDetail, setDayDetail] = useState<CalendarEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const monthStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, '0')}`;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar?month=${monthStr}`)
      .then(r => r.json())
      .then(data => setEntries(data.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [monthStr]);

  useEffect(() => {
    if (!selectedDay) { setDayDetail(null); return; }
    fetch(`/api/calendar?day=${selectedDay}`)
      .then(r => r.json())
      .then(data => setDayDetail(data.entries?.[0] || null))
      .catch(() => setDayDetail(null));
  }, [selectedDay]);

  const prevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: m };
    });
    setSelectedDay(null);
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: m };
    });
    setSelectedDay(null);
  }, []);

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDayOffset = getFirstDayOffset(currentMonth.year, currentMonth.month);

  const entryMap = new Map<string, CalendarEntry>();
  const maxSize = Math.max(1, ...entries.map(e => e.size));
  for (const e of entries) entryMap.set(e.date, e);

  // Build unique agent list for consistent coloring
  const allAgents = [...new Set(entries.flatMap(e => e.agents))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>
          ▦ Activity Calendar
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="px-2 py-1 rounded text-sm transition-colors"
            style={{ color: 'var(--grid-text-dim)', background: 'var(--grid-surface)' }}
          >
            ◀
          </button>
          <span className="text-sm font-medium min-w-[140px] text-center" style={{ color: 'var(--grid-text)' }}>
            {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
          </span>
          <button
            onClick={nextMonth}
            className="px-2 py-1 rounded text-sm transition-colors"
            style={{ color: 'var(--grid-text-dim)', background: 'var(--grid-surface)' }}
          >
            ▶
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="rounded-lg p-3"
        style={{ background: 'var(--grid-surface)', border: '1px solid var(--grid-border)' }}
      >
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-[10px] uppercase tracking-wider py-1" style={{ color: 'var(--grid-text-muted)' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {/* Offset cells */}
          {Array.from({ length: firstDayOffset }).map((_, i) => (
            <div key={`offset-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${monthStr}-${String(dayNum).padStart(2, '0')}`;
            const entry = entryMap.get(dateStr);
            const intensity = entry ? Math.min(100, Math.max(15, (entry.size / maxSize) * 100)) : 0;
            const isSelected = selectedDay === dateStr;

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className="aspect-square rounded flex flex-col items-center justify-center gap-0.5 transition-all text-xs relative"
                style={{
                  background: intensity > 0
                    ? `color-mix(in srgb, var(--grid-accent) ${intensity}%, transparent)`
                    : 'transparent',
                  color: intensity > 50 ? 'var(--grid-bg)' : 'var(--grid-text-dim)',
                  border: isSelected ? '2px solid var(--grid-accent)' : '1px solid transparent',
                  cursor: entry ? 'pointer' : 'default',
                }}
              >
                <span className="font-mono text-[11px]">{dayNum}</span>
                {entry && (
                  <div className="flex gap-[2px]">
                    {entry.agents.map((agent, ai) => (
                      <span
                        key={agent}
                        className="block rounded-full"
                        style={{
                          width: 4,
                          height: 4,
                          background: AGENT_COLORS[allAgents.indexOf(agent) % AGENT_COLORS.length],
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Agent legend */}
        {allAgents.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3 pt-2" style={{ borderTop: '1px solid var(--grid-border)' }}>
            {allAgents.map((agent, i) => (
              <div key={agent} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--grid-text-dim)' }}>
                <span
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: AGENT_COLORS[i % AGENT_COLORS.length], display: 'inline-block' }}
                />
                {agent}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selectedDay && (
        <div
          className="rounded-lg p-4 space-y-3"
          style={{ background: 'var(--grid-surface)', border: '1px solid var(--grid-border)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>
              📅 {selectedDay}
            </h2>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs px-2 py-0.5 rounded"
              style={{ color: 'var(--grid-text-dim)', background: 'var(--grid-surface-hover)' }}
            >
              ✕
            </button>
          </div>

          {dayDetail ? (
            <div className="space-y-2">
              {dayDetail.agents.map((agent, i) => (
                <div key={agent} className="rounded p-2" style={{ background: 'var(--grid-bg)', border: '1px solid var(--grid-border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="rounded-full"
                      style={{ width: 6, height: 6, background: AGENT_COLORS[allAgents.indexOf(agent) % AGENT_COLORS.length], display: 'inline-block' }}
                    />
                    <span className="text-xs font-medium" style={{ color: 'var(--grid-text)' }}>{agent}</span>
                  </div>
                  {dayDetail.previews[agent] && (
                    <pre className="text-[10px] whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--grid-text-dim)' }}>
                      {dayDetail.previews[agent]}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs animate-pulse" style={{ color: 'var(--grid-text-muted)' }}>Loading...</div>
          )}
        </div>
      )}

      {loading && (
        <div className="text-xs text-center" style={{ color: 'var(--grid-text-muted)' }}>Loading calendar data...</div>
      )}
    </div>
  );
}
