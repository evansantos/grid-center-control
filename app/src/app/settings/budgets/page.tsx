'use client';

import { useState } from 'react';

interface Budget {
  id: string;
  name: string;
  type: 'global' | 'agent';
  amount: number;
  spent: number;
  period: 'daily' | 'weekly';
  autoPause: boolean;
  alertThresholds: number[];
}

const initialBudgets: Budget[] = [
  { id: 'global', name: 'Global Budget', type: 'global', amount: 50, spent: 37.42, period: 'daily', autoPause: false, alertThresholds: [80, 90, 100] },
  { id: 'agent-po', name: 'Po (Orchestrator)', type: 'agent', amount: 15, spent: 13.80, period: 'daily', autoPause: true, alertThresholds: [80, 90, 100] },
  { id: 'agent-coder', name: 'Coder', type: 'agent', amount: 12, spent: 8.40, period: 'daily', autoPause: true, alertThresholds: [80, 90, 100] },
  { id: 'agent-researcher', name: 'Researcher', type: 'agent', amount: 8, spent: 6.90, period: 'daily', autoPause: false, alertThresholds: [80, 90, 100] },
  { id: 'agent-reviewer', name: 'Reviewer', type: 'agent', amount: 5, spent: 2.10, period: 'daily', autoPause: true, alertThresholds: [80, 90, 100] },
  { id: 'agent-deployer', name: 'Deployer', type: 'agent', amount: 10, spent: 6.22, period: 'weekly', autoPause: false, alertThresholds: [80, 90, 100] },
];

function getThresholdColor(pct: number): string {
  if (pct >= 100) return '#ef4444';
  if (pct >= 90) return '#f97316';
  if (pct >= 80) return '#eab308';
  return 'var(--grid-accent)';
}

function getThresholdLabel(pct: number): string {
  if (pct >= 100) return '🔴 EXCEEDED';
  if (pct >= 90) return '🟠 CRITICAL';
  if (pct >= 80) return '🟡 WARNING';
  return '🟢 OK';
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editPeriod, setEditPeriod] = useState<'daily' | 'weekly'>('daily');
  const [editAutoPause, setEditAutoPause] = useState(false);

  const openEdit = (b: Budget) => {
    setEditing(b);
    setEditAmount(String(b.amount));
    setEditPeriod(b.period);
    setEditAutoPause(b.autoPause);
  };

  const saveEdit = () => {
    if (!editing) return;
    setBudgets(prev => prev.map(b =>
      b.id === editing.id ? { ...b, amount: parseFloat(editAmount) || b.amount, period: editPeriod, autoPause: editAutoPause } : b
    ));
    setEditing(null);
  };

  const toggleAutoPause = (id: string) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, autoPause: !b.autoPause } : b));
  };

  const globalBudget = budgets.find(b => b.type === 'global')!;
  const agentBudgets = budgets.filter(b => b.type === 'agent');

  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-2">Cost Budgets & Alerts</h1>
          <p className="text-[var(--grid-text-dim)] font-mono">Set daily/weekly budgets per agent. Auto-pause on limit.</p>
        </div>

        {/* Global Budget Card */}
        <BudgetCard budget={globalBudget} onEdit={() => openEdit(globalBudget)} onTogglePause={() => toggleAutoPause(globalBudget.id)} isGlobal />

        {/* Agent Budgets */}
        <h2 className="text-xl font-mono font-bold mt-8 mb-4">Agent Budgets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agentBudgets.map(b => (
            <BudgetCard key={b.id} budget={b} onEdit={() => openEdit(b)} onTogglePause={() => toggleAutoPause(b.id)} />
          ))}
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEditing(null)}>
            <div className="p-6 rounded-lg border w-full max-w-md" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }} onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-mono font-bold mb-4">Edit Budget: {editing.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-[var(--grid-text-dim)] mb-1">Budget Amount ($)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded border font-mono bg-[var(--grid-bg)] text-[var(--grid-text)]"
                    style={{ borderColor: 'var(--grid-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-mono text-[var(--grid-text-dim)] mb-1">Period</label>
                  <select
                    value={editPeriod}
                    onChange={e => setEditPeriod(e.target.value as 'daily' | 'weekly')}
                    className="w-full px-3 py-2 rounded border font-mono bg-[var(--grid-bg)] text-[var(--grid-text)]"
                    style={{ borderColor: 'var(--grid-border)' }}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 font-mono text-sm cursor-pointer">
                  <input type="checkbox" checked={editAutoPause} onChange={e => setEditAutoPause(e.target.checked)} className="accent-[var(--grid-accent)]" />
                  Auto-pause when budget exceeded
                </label>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveEdit} className="flex-1 px-4 py-2 rounded font-mono font-bold text-white" style={{ background: 'var(--grid-accent)' }}>Save</button>
                  <button onClick={() => setEditing(null)} className="flex-1 px-4 py-2 rounded font-mono border" style={{ borderColor: 'var(--grid-border)' }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BudgetCard({ budget, onEdit, onTogglePause, isGlobal }: { budget: Budget; onEdit: () => void; onTogglePause: () => void; isGlobal?: boolean }) {
  const pct = Math.min((budget.spent / budget.amount) * 100, 120);
  const displayPct = Math.round(pct);
  const color = getThresholdColor(pct);
  const label = getThresholdLabel(pct);

  return (
    <div className={`rounded-lg border p-5 ${isGlobal ? 'mb-2' : ''}`} style={{ background: 'var(--grid-surface)', borderColor: pct >= 90 ? color : 'var(--grid-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-mono font-bold text-lg">{budget.name}</h3>
          <span className="text-xs font-mono text-[var(--grid-text-dim)]">{budget.period}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: color + '22', color }}>{label}</span>
          <button onClick={onEdit} className="text-xs font-mono px-2 py-1 rounded border hover:opacity-80" style={{ borderColor: 'var(--grid-border)' }}>Edit</button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-mono font-bold">${budget.spent.toFixed(2)}</span>
        <span className="text-sm font-mono text-[var(--grid-text-dim)]">/ ${budget.amount.toFixed(2)}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 rounded-full overflow-hidden mb-3" style={{ background: 'var(--grid-bg)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
      </div>
      <div className="flex items-center justify-between text-xs font-mono text-[var(--grid-text-dim)]">
        <span>{displayPct}% used</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <span>Auto-pause</span>
          <button
            onClick={onTogglePause}
            className="relative w-9 h-5 rounded-full transition-colors"
            style={{ background: budget.autoPause ? 'var(--grid-accent)' : 'var(--grid-border)' }}
          >
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: budget.autoPause ? '18px' : '2px' }} />
          </button>
        </label>
      </div>
    </div>
  );
}
