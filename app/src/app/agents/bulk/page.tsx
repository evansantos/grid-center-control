'use client';

import { useState } from 'react';

const SAMPLE_AGENTS = [
  { id: 'agent-po', name: 'po', role: 'Project Orchestrator', status: 'running' },
  { id: 'agent-dev', name: 'dev', role: 'Developer', status: 'running' },
  { id: 'agent-qa', name: 'qa', role: 'Quality Assurance', status: 'idle' },
  { id: 'agent-ui', name: 'ui', role: 'UI Designer', status: 'running' },
  { id: 'agent-ops', name: 'ops', role: 'DevOps Engineer', status: 'stopped' },
  { id: 'agent-sec', name: 'sec', role: 'Security Analyst', status: 'idle' },
];

type BulkAction = 'restart' | 'broadcast' | 'update-config';

interface ActionResult {
  agentId: string;
  success: boolean;
  message: string;
}

export default function BulkOperationsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<BulkAction>('restart');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ActionResult[] | null>(null);

  const toggleAgent = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === SAMPLE_AGENTS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(SAMPLE_AGENTS.map((a) => a.id)));
    }
  };

  const actionLabel: Record<BulkAction, string> = {
    restart: 'Restart All Selected',
    broadcast: 'Broadcast Message',
    'update-config': 'Update Config',
  };

  const handleExecute = async () => {
    setShowConfirm(false);
    setLoading(true);
    setResults(null);

    const payload: Record<string, unknown> = {};
    if (action === 'broadcast') payload.message = broadcastMsg;
    if (action === 'update-config') payload.config = { [configKey]: configValue };

    try {
      const res = await fetch('/api/agents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentIds: [...selected], action, payload }),
      });
      const data = await res.json();
      setResults(data.results);
    } catch {
      setResults(
        [...selected].map((id) => ({ agentId: id, success: false, message: 'Network error' }))
      );
    } finally {
      setLoading(false);
    }
  };

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-wide mb-2" style={{ color: 'var(--grid-text)' }}>
          Bulk Operations
        </h1>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          Select agents and apply actions in bulk
        </p>
      </div>

      {/* Agent Selection */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--grid-border)' }}
        >
          <input
            type="checkbox"
            checked={selected.size === SAMPLE_AGENTS.length}
            onChange={toggleAll}
            className="w-4 h-4 accent-[var(--grid-accent)]"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--grid-text-dim)' }}>
            {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
          </span>
        </div>

        {SAMPLE_AGENTS.map((agent) => (
          <label
            key={agent.id}
            className="flex items-center gap-3 px-4 py-3 border-b cursor-pointer hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--grid-border)' }}
          >
            <input
              type="checkbox"
              checked={selected.has(agent.id)}
              onChange={() => toggleAgent(agent.id)}
              className="w-4 h-4 accent-[var(--grid-accent)]"
            />
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--grid-accent)20', color: 'var(--grid-accent)' }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <span className="font-medium" style={{ color: 'var(--grid-text)' }}>
                {agent.name}
              </span>
              <span className="ml-2 text-sm" style={{ color: 'var(--grid-text-dim)' }}>
                {agent.role}
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background:
                  agent.status === 'running'
                    ? '#22c55e20'
                    : agent.status === 'idle'
                      ? '#eab30820'
                      : '#ef444420',
                color:
                  agent.status === 'running'
                    ? '#22c55e'
                    : agent.status === 'idle'
                      ? '#eab308'
                      : '#ef4444',
              }}
            >
              {agent.status}
            </span>
          </label>
        ))}
      </div>

      {/* Action Selection */}
      <div
        className="p-4 rounded-lg border space-y-4"
        style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}
      >
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium" style={{ color: 'var(--grid-text)' }}>
            Action:
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as BulkAction)}
            className="px-3 py-2 rounded border text-sm"
            style={{
              background: 'var(--grid-bg)',
              borderColor: 'var(--grid-border)',
              color: 'var(--grid-text)',
            }}
          >
            <option value="restart">Restart</option>
            <option value="broadcast">Broadcast Message</option>
            <option value="update-config">Update Config</option>
          </select>
        </div>

        {action === 'broadcast' && (
          <input
            type="text"
            placeholder="Enter broadcast message..."
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            className="w-full px-3 py-2 rounded border text-sm"
            style={{
              background: 'var(--grid-bg)',
              borderColor: 'var(--grid-border)',
              color: 'var(--grid-text)',
            }}
          />
        )}

        {action === 'update-config' && (
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Config key"
              value={configKey}
              onChange={(e) => setConfigKey(e.target.value)}
              className="flex-1 px-3 py-2 rounded border text-sm"
              style={{
                background: 'var(--grid-bg)',
                borderColor: 'var(--grid-border)',
                color: 'var(--grid-text)',
              }}
            />
            <input
              type="text"
              placeholder="Config value"
              value={configValue}
              onChange={(e) => setConfigValue(e.target.value)}
              className="flex-1 px-3 py-2 rounded border text-sm"
              style={{
                background: 'var(--grid-bg)',
                borderColor: 'var(--grid-border)',
                color: 'var(--grid-text)',
              }}
            />
          </div>
        )}

        <button
          onClick={() => setShowConfirm(true)}
          disabled={selected.size === 0 || loading}
          className="px-4 py-2 rounded text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ background: 'var(--grid-accent)', color: '#fff' }}
        >
          {loading ? 'Executing...' : actionLabel[action]}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className="p-6 rounded-lg border max-w-md w-full mx-4 space-y-4"
            style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}
          >
            <h2 className="text-lg font-bold" style={{ color: 'var(--grid-text)' }}>
              Confirm Bulk Action
            </h2>
            <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
              You are about to <strong>{action}</strong> {selected.size} agent
              {selected.size > 1 ? 's' : ''}:
            </p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--grid-text)' }}>
              {SAMPLE_AGENTS.filter((a) => selected.has(a.id)).map((a) => (
                <li key={a.id}>• {a.name} ({a.role})</li>
              ))}
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded text-sm border"
                style={{ borderColor: 'var(--grid-border)', color: 'var(--grid-text)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleExecute}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{ background: 'var(--grid-accent)', color: '#fff' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results && (
        <div
          className="p-4 rounded-lg border space-y-3"
          style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--grid-text)' }}>
            Results
          </h2>
          <div className="flex gap-4 text-sm">
            <span style={{ color: '#22c55e' }}>✓ {successCount} succeeded</span>
            {failCount > 0 && <span style={{ color: '#ef4444' }}>✗ {failCount} failed</span>}
          </div>
          <div className="space-y-1">
            {results.map((r) => (
              <div key={r.agentId} className="flex items-center gap-2 text-sm">
                <span style={{ color: r.success ? '#22c55e' : '#ef4444' }}>
                  {r.success ? '✓' : '✗'}
                </span>
                <span style={{ color: 'var(--grid-text)' }}>
                  {SAMPLE_AGENTS.find((a) => a.id === r.agentId)?.name ?? r.agentId}
                </span>
                <span style={{ color: 'var(--grid-text-dim)' }}>— {r.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
