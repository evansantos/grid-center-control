'use client';

import { useState } from 'react';

interface ActionDef {
  id: string;
  label: string;
  icon: string;
}

const DEFAULT_ACTIONS: ActionDef[] = [
  { id: 'run-build', label: 'Run Build', icon: '🔨' },
  { id: 'check-status', label: 'Check Status', icon: '📡' },
  { id: 'deploy-staging', label: 'Deploy Staging', icon: '🚀' },
  { id: 'generate-report', label: 'Generate Report', icon: '📄' },
];

export function QuickActions() {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const runAction = async (action: ActionDef) => {
    setLoading(action.id);
    setStatus(null);
    try {
      const res = await fetch('/api/agents/default/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action.id }),
      });
      const data = await res.json();
      setStatus({ message: data.message, type: 'success' });
    } catch {
      setStatus({ message: 'Failed to execute action', type: 'error' });
    } finally {
      setLoading(null);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--grid-border)', background: 'var(--grid-surface)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold cursor-pointer"
        style={{ color: 'var(--grid-text)', borderBottom: open ? '1px solid var(--grid-border)' : 'none' }}
      >
        <span>⚡ Quick Actions</span>
        <span className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {DEFAULT_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => runAction(action)}
                disabled={loading === action.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer disabled:opacity-50"
                style={{
                  border: '1px solid var(--grid-border)',
                  background: 'transparent',
                  color: 'var(--grid-text)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--grid-accent)';
                  e.currentTarget.style.color = 'var(--grid-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--grid-border)';
                  e.currentTarget.style.color = 'var(--grid-text)';
                }}
              >
                <span>{action.icon}</span>
                <span>{loading === action.id ? 'Running...' : action.label}</span>
              </button>
            ))}
          </div>

          {status && (
            <div
              className="text-xs px-3 py-2 rounded"
              style={{
                background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: status.type === 'success' ? '#22c55e' : '#ef4444',
              }}
            >
              {status.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
