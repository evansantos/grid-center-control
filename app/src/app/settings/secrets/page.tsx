'use client';

import { useState, useEffect, useMemo } from 'react';

interface SecretKey {
  id: string;
  name: string;
  provider: string;
  maskedKey: string;
  status: 'valid' | 'invalid' | 'rate-limited';
  agentsUsing: string[];
  lastUsed: string;
  created: string;
}

const providers = ['All', 'Anthropic', 'OpenAI', 'Google', 'ElevenLabs', 'Brave'] as const;
const statuses = ['All', 'valid', 'invalid', 'rate-limited'] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  valid: { label: '✅ Valid', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  invalid: { label: '❌ Invalid', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  'rate-limited': { label: '⚠️ Rate Limited', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const s = {
  page: { padding: '24px 32px', color: 'var(--grid-text)', minHeight: '100vh' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, margin: 0 } as React.CSSProperties,
  subtitle: { fontSize: 13, color: 'var(--grid-text-dim)', marginTop: 4 } as React.CSSProperties,
  filters: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' as const, alignItems: 'center' } as React.CSSProperties,
  select: { background: 'var(--grid-surface)', color: 'var(--grid-text)', border: '1px solid var(--grid-border)', borderRadius: 6, padding: '6px 10px', fontSize: 13 } as React.CSSProperties,
  input: { background: 'var(--grid-surface)', color: 'var(--grid-text)', border: '1px solid var(--grid-border)', borderRadius: 6, padding: '6px 12px', fontSize: 13, width: 220 } as React.CSSProperties,
  btn: { background: 'var(--grid-accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnSmall: { fontSize: 12, padding: '4px 10px', borderRadius: 5, border: '1px solid var(--grid-border)', background: 'var(--grid-surface)', color: 'var(--grid-text)', cursor: 'pointer' } as React.CSSProperties,
  btnDanger: { fontSize: 12, padding: '4px 10px', borderRadius: 5, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 } as React.CSSProperties,
  th: { textAlign: 'left' as const, padding: '10px 12px', borderBottom: '1px solid var(--grid-border)', color: 'var(--grid-text-dim)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '0.5px' } as React.CSSProperties,
  td: { padding: '12px', borderBottom: '1px solid var(--grid-border)', verticalAlign: 'middle' as const } as React.CSSProperties,
  badge: (color: string, bg: string) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, color, background: bg }) as React.CSSProperties,
  agentBadge: { display: 'inline-block', padding: '2px 7px', borderRadius: 10, fontSize: 11, background: 'var(--grid-surface)', border: '1px solid var(--grid-border)', color: 'var(--grid-text-dim)', marginRight: 4, marginBottom: 2 } as React.CSSProperties,
  mask: { fontFamily: 'monospace', fontSize: 13, color: 'var(--grid-text-dim)' } as React.CSSProperties,
  form: { background: 'var(--grid-surface)', border: '1px solid var(--grid-border)', borderRadius: 8, padding: 20, marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'flex-end' } as React.CSSProperties,
  formField: { display: 'flex', flexDirection: 'column' as const, gap: 4 } as React.CSSProperties,
  formLabel: { fontSize: 11, fontWeight: 600, color: 'var(--grid-text-dim)', textTransform: 'uppercase' as const } as React.CSSProperties,
};

export default function SecretsPage() {
  const [keys, setKeys] = useState<SecretKey[]>([]);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings/secrets')
      .then((r) => r.json())
      .then((d) => setKeys(d.keys))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return keys.filter((k) => {
      if (providerFilter !== 'All' && k.provider !== providerFilter) return false;
      if (statusFilter !== 'All' && k.status !== statusFilter) return false;
      if (search && !k.name.toLowerCase().includes(search.toLowerCase()) && !k.provider.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [keys, search, providerFilter, statusFilter]);

  function handleTest(id: string) {
    setTesting(id);
    setTimeout(() => {
      setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, status: Math.random() > 0.3 ? 'valid' : 'invalid' } : k)));
      setTesting(null);
    }, 1200);
  }

  function handleRevoke(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevoking(null);
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🔐 Secrets Vault</h1>
          <p style={s.subtitle}>Manage API keys and secrets used by your agents</p>
        </div>
        <button style={s.btn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Key'}
        </button>
      </div>

      {showForm && (
        <div style={s.form}>
          <div style={s.formField}>
            <label style={s.formLabel}>Name</label>
            <input style={s.input} placeholder="e.g. Production Key" />
          </div>
          <div style={s.formField}>
            <label style={s.formLabel}>Provider</label>
            <select style={s.select}>
              {providers.filter((p) => p !== 'All').map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div style={s.formField}>
            <label style={s.formLabel}>API Key</label>
            <input style={{ ...s.input, width: 300 }} type="password" placeholder="sk-..." />
          </div>
          <button style={s.btn} onClick={() => setShowForm(false)}>Save Key</button>
        </div>
      )}

      <div style={s.filters}>
        <input style={s.input} placeholder="Search by name or provider..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={s.select} value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
          {providers.map((p) => (
            <option key={p} value={p}>{p === 'All' ? 'All Providers' : p}</option>
          ))}
        </select>
        <select style={s.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {statuses.map((st) => (
            <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: 'var(--grid-text-dim)' }}>{filtered.length} key{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Name</th>
            <th style={s.th}>Provider</th>
            <th style={s.th}>Key</th>
            <th style={s.th}>Status</th>
            <th style={s.th}>Agents Using</th>
            <th style={s.th}>Last Used</th>
            <th style={s.th}>Created</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((k) => {
            const sc = statusConfig[k.status];
            return (
              <tr key={k.id} style={{ transition: 'background 0.15s' }}>
                <td style={{ ...s.td, fontWeight: 600 }}>{k.name}</td>
                <td style={s.td}>{k.provider}</td>
                <td style={s.td}><code style={s.mask}>{k.maskedKey}</code></td>
                <td style={s.td}><span style={s.badge(sc.color, sc.bg)}>{sc.label}</span></td>
                <td style={s.td}>
                  {k.agentsUsing.length === 0
                    ? <span style={{ color: 'var(--grid-text-dim)', fontSize: 12 }}>None</span>
                    : k.agentsUsing.map((a) => <span key={a} style={s.agentBadge}>{a}</span>)}
                </td>
                <td style={{ ...s.td, color: 'var(--grid-text-dim)' }}>{relativeTime(k.lastUsed)}</td>
                <td style={{ ...s.td, color: 'var(--grid-text-dim)' }}>{formatDate(k.created)}</td>
                <td style={{ ...s.td, display: 'flex', gap: 6 }}>
                  <button style={s.btnSmall} onClick={() => handleTest(k.id)} disabled={testing === k.id}>
                    {testing === k.id ? '⏳ Testing...' : '🧪 Test'}
                  </button>
                  {revoking === k.id ? (
                    <>
                      <button style={s.btnDanger} onClick={() => handleRevoke(k.id)}>Confirm</button>
                      <button style={s.btnSmall} onClick={() => setRevoking(null)}>Cancel</button>
                    </>
                  ) : (
                    <button style={s.btnDanger} onClick={() => setRevoking(k.id)}>🗑 Revoke</button>
                  )}
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} style={{ ...s.td, textAlign: 'center', color: 'var(--grid-text-dim)', padding: 40 }}>
                No keys match your filters
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
