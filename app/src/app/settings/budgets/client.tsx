'use client';

import { useState, useEffect, useCallback } from 'react';

interface Budget {
  id: string;
  scope: 'global' | 'agent';
  agentName?: string;
  period: 'daily' | 'weekly';
  amount: number;
  alertThreshold: number;
  autoPause: boolean;
  currentSpend: number;
  createdAt: string;
}

const emptyForm = {
  scope: 'global' as const,
  agentName: '',
  period: 'daily' as const,
  amount: 0,
  alertThreshold: 80,
  autoPause: false,
};

export default function BudgetsClient() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchBudgets = useCallback(async () => {
    const res = await fetch('/api/settings/budgets');
    setBudgets(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch('/api/settings/budgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form }),
      });
    } else {
      await fetch('/api/settings/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm(emptyForm);
    setShowForm(false);
    setEditId(null);
    fetchBudgets();
  };

  const handleEdit = (b: Budget) => {
    setForm({
      scope: b.scope,
      agentName: b.agentName || '',
      period: b.period,
      amount: b.amount,
      alertThreshold: b.alertThreshold,
      autoPause: b.autoPause,
    });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/settings/budgets?id=${id}`, { method: 'DELETE' });
    fetchBudgets();
  };

  const pct = (b: Budget) => b.amount > 0 ? (b.currentSpend / b.amount) * 100 : 0;
  const isWarning = (b: Budget) => pct(b) >= b.alertThreshold;
  const isOver = (b: Budget) => pct(b) >= 100;

  if (loading) {
    return <div className="font-mono text-[var(--grid-text-dim)]">Loading budgets…</div>;
  }

  const warningBudgets = budgets.filter(isWarning);

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {warningBudgets.map((b) => (
        <div
          key={`alert-${b.id}`}
          className="p-4 rounded-lg border font-mono text-sm"
          style={{
            background: isOver(b) ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
            borderColor: isOver(b) ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.4)',
            color: isOver(b) ? '#fca5a5' : '#fcd34d',
          }}
        >
          <span className="font-bold">{isOver(b) ? '🚨 OVER BUDGET' : '⚠️ APPROACHING LIMIT'}</span>
          {' — '}
          {b.scope === 'global' ? 'Global' : b.agentName} ({b.period}): ${b.currentSpend.toFixed(2)} / ${b.amount.toFixed(2)} ({pct(b).toFixed(0)}%)
          {b.autoPause && isOver(b) && <span className="ml-2 text-red-400">[Auto-pause active]</span>}
        </div>
      ))}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <span className="font-mono text-sm text-[var(--grid-text-dim)]">{budgets.length} budget(s) configured</span>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm); }}
          className="px-4 py-2 rounded font-mono text-sm"
          style={{ background: 'var(--grid-accent)', color: 'var(--grid-bg)' }}
        >
          {showForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-lg border border-[var(--grid-border)] bg-[var(--grid-surface)]" style={{ background: 'var(--grid-surface, rgba(255,255,255,0.03))' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
            <label className="block">
              <span className="text-[var(--grid-text-dim)]">Scope</span>
              <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as 'global' | 'agent' })} className="mt-1 block w-full p-2 rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] text-[var(--grid-text)]">
                <option value="global">Global</option>
                <option value="agent">Per Agent</option>
              </select>
            </label>
            {form.scope === 'agent' && (
              <label className="block">
                <span className="text-[var(--grid-text-dim)]">Agent Name</span>
                <input value={form.agentName} onChange={(e) => setForm({ ...form, agentName: e.target.value })} placeholder="e.g. po" className="mt-1 block w-full p-2 rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] text-[var(--grid-text)]" required />
              </label>
            )}
            <label className="block">
              <span className="text-[var(--grid-text-dim)]">Period</span>
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as 'daily' | 'weekly' })} className="mt-1 block w-full p-2 rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] text-[var(--grid-text)]">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[var(--grid-text-dim)]">Budget Amount ($)</span>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} className="mt-1 block w-full p-2 rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] text-[var(--grid-text)]" required />
            </label>
            <label className="block">
              <span className="text-[var(--grid-text-dim)]">Alert Threshold (%)</span>
              <input type="number" min="0" max="100" value={form.alertThreshold} onChange={(e) => setForm({ ...form, alertThreshold: parseInt(e.target.value) || 80 })} className="mt-1 block w-full p-2 rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] text-[var(--grid-text)]" />
            </label>
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.autoPause} onChange={(e) => setForm({ ...form, autoPause: e.target.checked })} className="rounded" />
              <span className="text-[var(--grid-text-dim)]">Auto-pause when budget exceeded</span>
            </label>
          </div>
          <div className="mt-4">
            <button type="submit" className="px-4 py-2 rounded font-mono text-sm" style={{ background: 'var(--grid-accent)', color: 'var(--grid-bg)' }}>
              {editId ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const p = pct(b);
          const barColor = isOver(b) ? '#ef4444' : isWarning(b) ? '#f59e0b' : 'var(--grid-accent)';
          return (
            <div key={b.id} className="p-4 rounded-lg border border-[var(--grid-border)] font-mono text-sm" style={{ background: 'var(--grid-surface, rgba(255,255,255,0.03))' }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-[var(--grid-text)]">
                    {b.scope === 'global' ? '🌐 Global' : `🤖 ${b.agentName}`}
                  </div>
                  <div className="text-[var(--grid-text-dim)] text-xs mt-0.5">
                    {b.period} · alert @ {b.alertThreshold}%
                    {b.autoPause && ' · auto-pause'}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(b)} className="px-2 py-1 text-xs rounded border border-[var(--grid-border)] text-[var(--grid-text-dim)] hover:text-[var(--grid-text)]">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="px-2 py-1 text-xs rounded border border-red-800 text-red-400 hover:bg-red-900/30">Del</button>
                </div>
              </div>
              <div className="mb-2">
                <span className="text-lg font-bold" style={{ color: barColor }}>${b.currentSpend.toFixed(2)}</span>
                <span className="text-[var(--grid-text-dim)]"> / ${b.amount.toFixed(2)}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[var(--grid-border)] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(p, 100)}%`, background: barColor }} />
              </div>
              <div className="text-right text-xs text-[var(--grid-text-dim)] mt-1">{p.toFixed(0)}%</div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12 font-mono text-[var(--grid-text-dim)]">
          No budgets configured. Click &quot;+ Add Budget&quot; to get started.
        </div>
      )}
    </div>
  );
}
