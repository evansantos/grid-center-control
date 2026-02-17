'use client';

import { useState } from 'react';

const SAMPLE_AGENTS = [
  { id: 'agent-po', name: 'po', role: 'Project Orchestrator', status: 'online' },
  { id: 'agent-dev', name: 'dev', role: 'Developer', status: 'online' },
  { id: 'agent-qa', name: 'qa', role: 'Quality Assurance', status: 'offline' },
  { id: 'agent-ui', name: 'ui', role: 'UI Designer', status: 'online' },
  { id: 'agent-ops', name: 'ops', role: 'DevOps Engineer', status: 'idle' },
  { id: 'agent-sec', name: 'sec', role: 'Security Analyst', status: 'online' },
];

const BULK_ACTIONS = [
  { value: '', label: 'Select action…' },
  { value: 'restart', label: 'Restart All' },
  { value: 'broadcast', label: 'Broadcast Message' },
  { value: 'update-config', label: 'Update Config' },
];

type Result = { agentId: string; success: boolean; message: string };

export default function BulkOperationsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [action, setAction] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Result[] | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const allSelected = selected.size === SAMPLE_AGENTS.length;
  const noneSelected = selected.size === 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(SAMPLE_AGENTS.map((a) => a.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function execute() {
    setShowConfirm(false);
    setLoading(true);
    setResults(null);
    setProgress(0);

    const ids = Array.from(selected);
    // Simulate progress
    for (let i = 1; i <= ids.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setProgress(Math.round((i / ids.length) * 100));
    }

    try {
      const res = await fetch('/api/agents/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentIds: ids,
          action,
          payload: action === 'broadcast' ? { message: broadcastMsg } : undefined,
        }),
      });
      const data = await res.json();
      setResults(data.results);
    } catch {
      setResults(ids.map((id) => ({ agentId: id, success: false, message: 'Request failed' })));
    } finally {
      setLoading(false);
    }
  }

  const actionLabel = BULK_ACTIONS.find((a) => a.value === action)?.label ?? action;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: 'var(--grid-text)', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Bulk Operations
        </h1>
        <p style={{ color: 'var(--grid-text-dim)', fontSize: 14 }}>
          Select agents and apply actions in bulk
        </p>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          marginBottom: 16,
          borderRadius: 8,
          background: 'var(--grid-surface)',
          border: '1px solid var(--grid-border)',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={toggleAll}
          style={{
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid var(--grid-border)',
            background: 'var(--grid-bg)',
            color: 'var(--grid-text)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>

        <span style={{ color: 'var(--grid-text-dim)', fontSize: 13 }}>
          {selected.size} of {SAMPLE_AGENTS.length} selected
        </span>

        <div style={{ flex: 1 }} />

        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setResults(null); }}
          disabled={noneSelected}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid var(--grid-border)',
            background: 'var(--grid-bg)',
            color: noneSelected ? 'var(--grid-text-dim)' : 'var(--grid-text)',
            cursor: noneSelected ? 'not-allowed' : 'pointer',
            fontSize: 13,
          }}
        >
          {BULK_ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={noneSelected || !action || loading}
          style={{
            padding: '6px 18px',
            borderRadius: 6,
            border: 'none',
            background: noneSelected || !action ? 'var(--grid-border)' : 'var(--grid-accent)',
            color: noneSelected || !action ? 'var(--grid-text-dim)' : '#fff',
            cursor: noneSelected || !action || loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Execute
        </button>
      </div>

      {/* Broadcast message input */}
      {action === 'broadcast' && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Enter broadcast message…"
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--grid-border)',
              background: 'var(--grid-bg)',
              color: 'var(--grid-text)',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Agent list */}
      <div
        style={{
          borderRadius: 8,
          border: '1px solid var(--grid-border)',
          overflow: 'hidden',
        }}
      >
        {SAMPLE_AGENTS.map((agent, i) => (
          <label
            key={agent.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: selected.has(agent.id) ? 'var(--grid-accent)10' : 'var(--grid-surface)',
              borderBottom: i < SAMPLE_AGENTS.length - 1 ? '1px solid var(--grid-border)' : 'none',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={selected.has(agent.id)}
              onChange={() => toggleOne(agent.id)}
              style={{ accentColor: 'var(--grid-accent)', width: 16, height: 16 }}
            />
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                background: 'var(--grid-accent)20',
                color: 'var(--grid-accent)',
                flexShrink: 0,
              }}
            >
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--grid-text)', fontWeight: 600, fontSize: 14 }}>{agent.name}</div>
              <div style={{ color: 'var(--grid-text-dim)', fontSize: 12 }}>{agent.role}</div>
            </div>
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                fontWeight: 600,
                background:
                  agent.status === 'online'
                    ? '#22c55e20'
                    : agent.status === 'idle'
                    ? '#eab30820'
                    : '#ef444420',
                color:
                  agent.status === 'online'
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

      {/* Progress */}
      {loading && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--grid-text-dim)', marginBottom: 6 }}>
            Executing {actionLabel}… {progress}%
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--grid-border)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--grid-accent)',
                borderRadius: 3,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div
          style={{
            marginTop: 16,
            borderRadius: 8,
            border: '1px solid var(--grid-border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              background: 'var(--grid-surface)',
              borderBottom: '1px solid var(--grid-border)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--grid-text)',
            }}
          >
            Results — {actionLabel}
          </div>
          {results.map((r) => (
            <div
              key={r.agentId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                borderBottom: '1px solid var(--grid-border)',
                fontSize: 13,
              }}
            >
              <span style={{ color: 'var(--grid-text)' }}>{r.agentId}</span>
              <span style={{ color: r.success ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                {r.success ? '✓ ' : '✗ '}
                {r.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--grid-surface)',
              border: '1px solid var(--grid-border)',
              borderRadius: 12,
              padding: 24,
              maxWidth: 420,
              width: '90%',
            }}
          >
            <h2 style={{ color: 'var(--grid-text)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Confirm Bulk Action
            </h2>
            <p style={{ color: 'var(--grid-text-dim)', fontSize: 14, marginBottom: 20 }}>
              Apply <strong style={{ color: 'var(--grid-text)' }}>{actionLabel}</strong> to{' '}
              <strong style={{ color: 'var(--grid-text)' }}>{selected.size}</strong> agent
              {selected.size !== 1 ? 's' : ''}?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid var(--grid-border)',
                  background: 'var(--grid-bg)',
                  color: 'var(--grid-text)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                onClick={execute}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'var(--grid-accent)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
