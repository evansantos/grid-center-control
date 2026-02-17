'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface ModelData {
  name: string;
  avgLatency: number;
  costPer1k: number;
  qualityScore: number;
  totalRequests: number;
  errorRate: number;
}

type SortKey = keyof ModelData;
type SortDir = 'asc' | 'desc';
type TimeRange = '24h' | '7d' | '30d';

// lower-is-better columns
const lowerIsBetter = new Set<SortKey>(['avgLatency', 'costPer1k', 'errorRate']);

export default function ModelComparisonDashboard() {
  const [models, setModels] = useState<ModelData[]>([]);
  const [range, setRange] = useState<TimeRange>('24h');
  const [sortKey, setSortKey] = useState<SortKey>('qualityScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    fetch(`/api/analytics/models?range=${range}`)
      .then(r => r.json())
      .then(d => setModels(d.models))
      .catch(() => {});
  }, [range]);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey(prev => {
      if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return key; }
      setSortDir(key === 'name' ? 'asc' : 'desc');
      return key;
    });
  }, []);

  const sorted = useMemo(() => {
    const s = [...models].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return s;
  }, [models, sortKey, sortDir]);

  // Compute best/worst per numeric column
  const highlights = useMemo(() => {
    const keys: SortKey[] = ['avgLatency', 'costPer1k', 'qualityScore', 'totalRequests', 'errorRate'];
    const m: Record<string, { best: number; worst: number }> = {};
    for (const k of keys) {
      const vals = models.map(x => x[k] as number);
      if (!vals.length) continue;
      const low = lowerIsBetter.has(k);
      m[k] = { best: low ? Math.min(...vals) : Math.max(...vals), worst: low ? Math.max(...vals) : Math.min(...vals) };
    }
    return m;
  }, [models]);

  const cellStyle = (key: SortKey, val: number): React.CSSProperties => {
    const h = highlights[key];
    if (!h) return {};
    if (val === h.best) return { color: '#22c55e', fontWeight: 700 };
    if (val === h.worst) return { color: '#ef4444', fontWeight: 700 };
    return {};
  };

  const maxLatency = Math.max(...models.map(m => m.avgLatency), 1);
  const maxCost = Math.max(...models.map(m => m.costPer1k), 0.001);

  const s = {
    page: { padding: 24, color: 'var(--grid-text)', background: 'var(--grid-bg)', minHeight: '100vh' } as React.CSSProperties,
    h1: { fontSize: 24, fontWeight: 700, marginBottom: 4 } as React.CSSProperties,
    sub: { color: 'var(--grid-text-dim)', fontSize: 14, marginBottom: 20 } as React.CSSProperties,
    filters: { display: 'flex', gap: 8, marginBottom: 24 } as React.CSSProperties,
    btn: (active: boolean): React.CSSProperties => ({
      padding: '6px 16px', borderRadius: 6, border: '1px solid var(--grid-border)', cursor: 'pointer',
      background: active ? 'var(--grid-accent)' : 'var(--grid-surface)', color: active ? '#fff' : 'var(--grid-text)',
      fontWeight: active ? 600 : 400, fontSize: 13,
    }),
    table: { width: '100%', borderCollapse: 'collapse' as const, marginBottom: 32 } as React.CSSProperties,
    th: (k: SortKey): React.CSSProperties => ({
      textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid var(--grid-border)',
      cursor: 'pointer', fontSize: 13, color: 'var(--grid-text-dim)', fontWeight: 600, userSelect: 'none',
      background: sortKey === k ? 'var(--grid-surface)' : 'transparent',
    }),
    td: { padding: '10px 12px', borderBottom: '1px solid var(--grid-border)', fontSize: 14 } as React.CSSProperties,
    section: { marginBottom: 32 } as React.CSSProperties,
    sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 12 } as React.CSSProperties,
    barRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 } as React.CSSProperties,
    barLabel: { width: 180, fontSize: 13, color: 'var(--grid-text-dim)', textAlign: 'right' as const, flexShrink: 0 } as React.CSSProperties,
    barTrack: { flex: 1, height: 20, background: 'var(--grid-surface)', borderRadius: 4, overflow: 'hidden' } as React.CSSProperties,
    barValue: { fontSize: 13, width: 70, flexShrink: 0 } as React.CSSProperties,
  };

  const arrow = (k: SortKey) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const columns: { key: SortKey; label: string; fmt: (v: ModelData) => string }[] = [
    { key: 'name', label: 'Model Name', fmt: v => v.name },
    { key: 'avgLatency', label: 'Avg Latency (ms)', fmt: v => v.avgLatency.toLocaleString() },
    { key: 'costPer1k', label: 'Cost / 1K tokens', fmt: v => `$${v.costPer1k.toFixed(3)}` },
    { key: 'qualityScore', label: 'Quality Score', fmt: v => String(v.qualityScore) },
    { key: 'totalRequests', label: 'Total Requests', fmt: v => v.totalRequests.toLocaleString() },
    { key: 'errorRate', label: 'Error Rate %', fmt: v => `${v.errorRate.toFixed(1)}%` },
  ];

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Model Comparison</h1>
      <p style={s.sub}>Compare performance, cost, and quality across AI models</p>

      {/* Time range filter */}
      <div style={s.filters}>
        {(['24h', '7d', '30d'] as TimeRange[]).map(r => (
          <button key={r} style={s.btn(range === r)} onClick={() => setRange(r)}>{r}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={s.table}>
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} style={s.th(c.key)} onClick={() => handleSort(c.key)}>
                  {c.label}{arrow(c.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(m => (
              <tr key={m.name} style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--grid-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent)')}>
                {columns.map(c => (
                  <td key={c.key} style={{ ...s.td, ...(c.key !== 'name' ? cellStyle(c.key, m[c.key] as number) : {}), fontFamily: c.key === 'name' ? 'monospace' : 'inherit' }}>
                    {c.fmt(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Latency Bar Chart */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Latency Comparison</h2>
        {sorted.map(m => (
          <div key={m.name} style={s.barRow}>
            <div style={s.barLabel}>{m.name.replace(/-20\d{6}/, '')}</div>
            <div style={s.barTrack}>
              <div style={{
                width: `${(m.avgLatency / maxLatency) * 100}%`, height: '100%', borderRadius: 4,
                background: m.avgLatency === highlights.avgLatency?.best ? '#22c55e' : m.avgLatency === highlights.avgLatency?.worst ? '#ef4444' : 'var(--grid-accent)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={s.barValue}>{m.avgLatency}ms</div>
          </div>
        ))}
      </div>

      {/* Cost Bar Chart */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Cost Comparison (per 1K tokens)</h2>
        {sorted.map(m => (
          <div key={m.name} style={s.barRow}>
            <div style={s.barLabel}>{m.name.replace(/-20\d{6}/, '')}</div>
            <div style={s.barTrack}>
              <div style={{
                width: `${(m.costPer1k / maxCost) * 100}%`, height: '100%', borderRadius: 4,
                background: m.costPer1k === highlights.costPer1k?.best ? '#22c55e' : m.costPer1k === highlights.costPer1k?.worst ? '#ef4444' : 'var(--grid-accent)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={s.barValue}>${m.costPer1k.toFixed(3)}</div>
          </div>
        ))}
      </div>

      {/* Quality Score Ranking */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Quality Score Ranking</h2>
        {[...models].sort((a, b) => b.qualityScore - a.qualityScore).map((m, i) => (
          <div key={m.name} style={{ ...s.barRow, marginBottom: 10 }}>
            <div style={{ width: 24, fontSize: 16, fontWeight: 700, color: i === 0 ? '#facc15' : 'var(--grid-text-dim)' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </div>
            <div style={{ ...s.barLabel, width: 160 }}>{m.name.replace(/-20\d{6}/, '')}</div>
            <div style={s.barTrack}>
              <div style={{
                width: `${m.qualityScore}%`, height: '100%', borderRadius: 4,
                background: i === 0 ? '#22c55e' : i === models.length - 1 ? '#ef4444' : 'var(--grid-accent)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ ...s.barValue, fontWeight: 600 }}>{m.qualityScore}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
