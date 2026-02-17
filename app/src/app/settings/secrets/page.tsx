'use client';

import { useState, useEffect } from 'react';

interface SecretKey {
  id: string;
  name: string;
  provider: string;
  maskedValue: string;
  agents: string[];
  status: 'active' | 'expiring' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
}

const statusConfig = {
  active:   { color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400', label: 'Active' },
  expiring: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', label: 'Expiring' },
  expired:  { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400', label: 'Expired' },
  revoked:  { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: 'bg-gray-400', label: 'Revoked' },
};

const providers = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Cohere', 'Other'];

export default function SecretsPage() {
  const [keys, setKeys] = useState<SecretKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', provider: 'OpenAI', key: '' });
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings/secrets')
      .then(r => r.json())
      .then(setKeys)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.key) return;
    const res = await fetch('/api/settings/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const newKey = await res.json();
    setKeys(prev => [newKey, ...prev]);
    setForm({ name: '', provider: 'OpenAI', key: '' });
    setShowModal(false);
  };

  const handleRevoke = async (id: string) => {
    await fetch(`/api/settings/secrets?id=${id}`, { method: 'DELETE' });
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k));
    setConfirmRevoke(null);
  };

  const handleRotate = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'active' as const, maskedValue: k.maskedValue.slice(0, 4) + '...' + 'new' + k.maskedValue.slice(-2) } : k));
  };

  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-mono font-bold mb-2">API Key Vault</h1>
            <p className="text-[var(--grid-text-dim)] font-mono">Manage API keys and secrets across your agents</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg font-mono text-sm bg-[var(--grid-accent)] text-black hover:opacity-90 transition-opacity"
          >
            + Add Key
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[var(--grid-text-dim)] font-mono">Loading keys…</div>
        ) : (
          <div className="border border-[var(--grid-border)] rounded-xl overflow-hidden">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="bg-[var(--grid-surface)] border-b border-[var(--grid-border)]">
                  <th className="text-left p-4 text-[var(--grid-text-dim)] font-medium">Name</th>
                  <th className="text-left p-4 text-[var(--grid-text-dim)] font-medium">Provider</th>
                  <th className="text-left p-4 text-[var(--grid-text-dim)] font-medium">Key</th>
                  <th className="text-left p-4 text-[var(--grid-text-dim)] font-medium">Agents</th>
                  <th className="text-left p-4 text-[var(--grid-text-dim)] font-medium">Status</th>
                  <th className="text-right p-4 text-[var(--grid-text-dim)] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(key => {
                  const st = statusConfig[key.status];
                  return (
                    <tr key={key.id} className="border-b border-[var(--grid-border)] hover:bg-[var(--grid-surface)]/50 transition-colors">
                      <td className="p-4 font-semibold">{key.name}</td>
                      <td className="p-4 text-[var(--grid-text-dim)]">{key.provider}</td>
                      <td className="p-4">
                        <code className="px-2 py-1 rounded bg-[var(--grid-surface)] text-xs">{key.maskedValue}</code>
                      </td>
                      <td className="p-4">
                        {key.agents.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {key.agents.map(a => (
                              <span key={a} className="px-2 py-0.5 rounded-full bg-[var(--grid-accent)]/10 text-[var(--grid-accent)] text-xs">{a}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--grid-text-dim)] text-xs">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {key.status !== 'revoked' && (
                          <div className="flex gap-2 justify-end">
                            {(key.status === 'expired' || key.status === 'expiring') && (
                              <button onClick={() => handleRotate(key.id)} className="px-3 py-1 rounded text-xs border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                                Rotate
                              </button>
                            )}
                            {confirmRevoke === key.id ? (
                              <div className="flex gap-1">
                                <button onClick={() => handleRevoke(key.id)} className="px-3 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors">
                                  Confirm
                                </button>
                                <button onClick={() => setConfirmRevoke(null)} className="px-3 py-1 rounded text-xs border border-[var(--grid-border)] text-[var(--grid-text-dim)] hover:bg-[var(--grid-surface)] transition-colors">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmRevoke(key.id)} className="px-3 py-1 rounded text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                                Revoke
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Key Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded-xl p-6 w-full max-w-md font-mono" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Add API Key</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[var(--grid-text-dim)] mb-1">Key Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Production GPT-4"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--grid-bg)] border border-[var(--grid-border)] text-sm focus:outline-none focus:border-[var(--grid-accent)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--grid-text-dim)] mb-1">Provider</label>
                  <select
                    value={form.provider}
                    onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--grid-bg)] border border-[var(--grid-border)] text-sm focus:outline-none focus:border-[var(--grid-accent)]"
                  >
                    {providers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--grid-text-dim)] mb-1">API Key</label>
                  <input
                    type="password"
                    value={form.key}
                    onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 rounded-lg bg-[var(--grid-bg)] border border-[var(--grid-border)] text-sm focus:outline-none focus:border-[var(--grid-accent)]"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm border border-[var(--grid-border)] text-[var(--grid-text-dim)] hover:bg-[var(--grid-bg)] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm bg-[var(--grid-accent)] text-black hover:opacity-90 transition-opacity">
                    Add Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
