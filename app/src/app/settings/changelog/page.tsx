'use client';

import { useState, useEffect, useCallback } from 'react';

interface ChangelogEntry {
  id: string;
  timestamp: string;
  agent: string;
  changeType: string;
  description: string;
  diff: { before: string; after: string };
}

interface Stats {
  todayCount: number;
  mostActiveAgent: string;
  mostCommonType: string;
}

const CHANGE_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  soul_edit: { icon: '✏️', label: 'SOUL.md Edit', color: '#a78bfa' },
  cron_modified: { icon: '⏰', label: 'Cron Modified', color: '#f59e0b' },
  model_changed: { icon: '🧠', label: 'Model Changed', color: '#3b82f6' },
  skill_added: { icon: '➕', label: 'Skill Added', color: '#22c55e' },
  skill_removed: { icon: '➖', label: 'Skill Removed', color: '#ef4444' },
  config_updated: { icon: '⚙️', label: 'Config Updated', color: '#6b7280' },
};

const ALL_AGENTS = ['po', 'dev', 'qa', 'ui', 'main'];
const ALL_TYPES = Object.keys(CHANGE_TYPE_CONFIG);

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Filters
  const [agentFilter, setAgentFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = useCallback(async (newOffset: number, append: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (agentFilter) params.set('agent', agentFilter);
    if (typeFilters.size) params.set('changeTypes', [...typeFilters].join(','));
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    params.set('offset', String(newOffset));
    params.set('limit', '20');

    try {
      const res = await fetch(`/api/settings/changelog?${params}`);
      const data = await res.json();
      setEntries(prev => append ? [...prev, ...data.entries] : data.entries);
      setTotal(data.total);
      setStats(data.stats);
      setOffset(newOffset + data.entries.length);
    } finally {
      setLoading(false);
    }
  }, [agentFilter, typeFilters, dateFrom, dateTo]);

  useEffect(() => {
    setOffset(0);
    fetchData(0, false);
  }, [fetchData]);

  const toggleType = (t: string) => {
    setTypeFilters(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
    background: color + '22', color, border: `1px solid ${color}44`,
  });

  const inputStyle: React.CSSProperties = {
    background: 'var(--grid-surface)', color: 'var(--grid-text)', border: '1px solid var(--grid-border)',
    borderRadius: 6, padding: '6px 10px', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', color: 'var(--grid-text)' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Changelog / Audit Log</h1>
      <p style={{ color: 'var(--grid-text-dim)', fontSize: 14, marginBottom: 20 }}>Track every agent configuration change</p>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Changes Today', value: stats.todayCount },
            { label: 'Most Active', value: stats.mostActiveAgent },
            { label: 'Top Change Type', value: CHANGE_TYPE_CONFIG[stats.mostCommonType]?.label || stats.mostCommonType },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--grid-surface)', border: '1px solid var(--grid-border)',
              borderRadius: 8, padding: '12px 20px', flex: '1 1 0', minWidth: 160,
            }}>
              <div style={{ fontSize: 12, color: 'var(--grid-text-dim)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: 'var(--grid-surface)', border: '1px solid var(--grid-border)',
        borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--grid-text-dim)', marginBottom: 4 }}>Agent</label>
          <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={{ ...inputStyle, minWidth: 100 }}>
            <option value="">All</option>
            {ALL_AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--grid-text-dim)', marginBottom: 4 }}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--grid-text-dim)', marginBottom: 4 }}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 100%' }}>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--grid-text-dim)', marginBottom: 4 }}>Change Types</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ALL_TYPES.map(t => {
              const cfg = CHANGE_TYPE_CONFIG[t];
              const active = typeFilters.has(t);
              return (
                <button key={t} onClick={() => toggleType(t)} style={{
                  ...badgeStyle(cfg.color),
                  opacity: active ? 1 : 0.4,
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}>
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map(entry => {
          const cfg = CHANGE_TYPE_CONFIG[entry.changeType] || { icon: '❓', label: entry.changeType, color: '#888' };
          const isExpanded = expanded.has(entry.id);
          return (
            <div key={entry.id} style={{
              background: 'var(--grid-surface)', border: '1px solid var(--grid-border)',
              borderRadius: 8, padding: '12px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--grid-text-dim)', minWidth: 110 }}>{formatTime(entry.timestamp)}</span>
                <span style={{
                  background: 'var(--grid-accent)', color: 'var(--grid-bg)',
                  padding: '1px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                }}>{entry.agent}</span>
                <span style={badgeStyle(cfg.color)}>{cfg.icon} {cfg.label}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{entry.description}</span>
                <button onClick={() => toggleExpand(entry.id)} style={{
                  background: 'none', border: '1px solid var(--grid-border)', borderRadius: 4,
                  color: 'var(--grid-text-dim)', cursor: 'pointer', padding: '2px 8px', fontSize: 11,
                }}>
                  {isExpanded ? '▲ Hide' : '▼ Diff'}
                </button>
              </div>
              {isExpanded && (
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{
                    background: 'var(--grid-bg)', border: '1px solid var(--grid-border)',
                    borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap',
                  }}>
                    <div style={{ fontSize: 10, color: '#ef4444', marginBottom: 4, fontWeight: 600, fontFamily: 'sans-serif' }}>— Before</div>
                    {entry.diff.before}
                  </div>
                  <div style={{
                    background: 'var(--grid-bg)', border: '1px solid var(--grid-border)',
                    borderRadius: 6, padding: 10, fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap',
                  }}>
                    <div style={{ fontSize: 10, color: '#22c55e', marginBottom: 4, fontWeight: 600, fontFamily: 'sans-serif' }}>+ After</div>
                    {entry.diff.after}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {offset < total && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => fetchData(offset, true)} disabled={loading} style={{
            background: 'var(--grid-accent)', color: 'var(--grid-bg)',
            border: 'none', borderRadius: 6, padding: '8px 24px', fontSize: 13,
            fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
          }}>
            {loading ? 'Loading…' : `Load More (${total - offset} remaining)`}
          </button>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--grid-text-dim)' }}>No changelog entries match your filters.</div>
      )}
    </div>
  );
}
