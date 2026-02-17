'use client';

import { useState, useEffect, useMemo } from 'react';

interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  field: string;
  changeType: 'config_update' | 'model_change' | 'restart' | 'key_rotation';
  oldValue: string;
  newValue: string;
  changedBy: string;
  severity: 'info' | 'warning' | 'critical';
}

const severityConfig = {
  info:     { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', label: 'Info' },
  warning:  { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', label: 'Warning' },
  critical: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400', label: 'Critical' },
};

const changeTypeLabels: Record<string, string> = {
  config_update: 'Config Update',
  model_change: 'Model Change',
  restart: 'Restart',
  key_rotation: 'Key Rotation',
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    fetch('/api/settings/audit')
      .then(r => r.json())
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const agents = useMemo(() => [...new Set(entries.map(e => e.agent))].sort(), [entries]);
  const fields = useMemo(() => [...new Set(entries.map(e => e.field))].sort(), [entries]);

  const filtered = useMemo(() => {
    let result = entries;
    if (agentFilter) result = result.filter(e => e.agent === agentFilter);
    if (fieldFilter) result = result.filter(e => e.field === fieldFilter);
    if (severityFilter) result = result.filter(e => e.severity === severityFilter);
    return result;
  }, [entries, agentFilter, fieldFilter, severityFilter]);

  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-2">Audit Log</h1>
          <p className="text-[var(--grid-text-dim)] font-mono">Track configuration changes across all agents</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--grid-surface)] border border-[var(--grid-border)] text-sm font-mono focus:outline-none focus:border-[var(--grid-accent)]"
          >
            <option value="">All Agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={fieldFilter}
            onChange={e => setFieldFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--grid-surface)] border border-[var(--grid-border)] text-sm font-mono focus:outline-none focus:border-[var(--grid-accent)]"
          >
            <option value="">All Fields</option>
            {fields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--grid-surface)] border border-[var(--grid-border)] text-sm font-mono focus:outline-none focus:border-[var(--grid-accent)]"
          >
            <option value="">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          {(agentFilter || fieldFilter || severityFilter) && (
            <button
              onClick={() => { setAgentFilter(''); setFieldFilter(''); setSeverityFilter(''); }}
              className="px-3 py-2 rounded-lg text-sm font-mono border border-[var(--grid-border)] text-[var(--grid-text-dim)] hover:bg-[var(--grid-surface)] transition-colors"
            >
              Clear Filters
            </button>
          )}
          <span className="self-center text-xs text-[var(--grid-text-dim)] font-mono ml-auto">
            {filtered.length} entries
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--grid-text-dim)] font-mono">Loading audit log…</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(entry => {
              const sev = severityConfig[entry.severity];
              return (
                <div key={entry.id} className="flex items-start gap-4 p-4 rounded-xl border border-[var(--grid-border)] bg-[var(--grid-surface)] hover:border-[var(--grid-accent)]/30 transition-colors">
                  {/* Severity dot */}
                  <div className="pt-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${sev.dot}`} />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-semibold text-sm">{entry.agent}</span>
                      <span className="text-[var(--grid-text-dim)] text-xs font-mono">·</span>
                      <span className="text-xs font-mono text-[var(--grid-text-dim)]">{changeTypeLabels[entry.changeType]}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${sev.color}`}>
                        {sev.label}
                      </span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-[var(--grid-text-dim)]">{entry.field}:</span>{' '}
                      <span className="text-red-400/80 line-through">{entry.oldValue}</span>{' '}
                      <span className="text-[var(--grid-text-dim)]">→</span>{' '}
                      <span className="text-green-400">{entry.newValue}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-[var(--grid-text-dim)]">{formatTimestamp(entry.timestamp)}</div>
                    <div className="text-xs font-mono text-[var(--grid-text-dim)] mt-0.5">by {entry.changedBy}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
