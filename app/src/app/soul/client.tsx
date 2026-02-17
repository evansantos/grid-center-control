'use client';

import { useState, useEffect, useCallback } from 'react';

const FILES = ['SOUL.md', 'IDENTITY.md', 'USER.md', 'AGENTS.md', 'TOOLS.md'];

interface HistoryEntry {
  hash: string;
  message: string;
  date: string;
}

export function SoulEditor() {
  const [agents, setAgents] = useState<string[]>([]);
  const [agent, setAgent] = useState('');
  const [file, setFile] = useState('SOUL.md');
  const [content, setContent] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFile = useCallback(async (agentId: string, fileName: string, listAgents = false) => {
    setLoading(true);
    setMessage(null);
    try {
      const params = new URLSearchParams({ agent: agentId, file: fileName });
      if (listAgents) params.set('list', 'true');
      const res = await fetch(`/api/soul?${params}`);
      const data = await res.json();
      if (data.error) {
        setMessage({ type: 'error', text: data.error });
        return;
      }
      setContent(data.content || '');
      setHistory(data.history || []);
      if (data.agents) {
        setAgents(data.agents);
        if (!agentId && data.agents.length > 0) {
          setAgent(data.agents[0]);
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch file' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: get agent list
  useEffect(() => {
    // Try to fetch with empty agent to get list, then fetch first agent
    (async () => {
      try {
        const res = await fetch('/api/soul?agent=_&file=SOUL.md&list=true');
        const data = await res.json();
        if (data.agents && data.agents.length > 0) {
          setAgents(data.agents);
          const first = data.agents[0];
          setAgent(first);
          fetchFile(first, 'SOUL.md');
        } else {
          setLoading(false);
          setMessage({ type: 'error', text: 'No agents found' });
        }
      } catch {
        setLoading(false);
        setMessage({ type: 'error', text: 'Failed to load agents' });
      }
    })();
  }, [fetchFile]);

  useEffect(() => {
    if (agent) fetchFile(agent, file);
  }, [agent, file, fetchFile]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/soul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, file, content }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Saved successfully' });
        // Refresh history
        fetchFile(agent, file);
      } else {
        setMessage({ type: 'error', text: data.error || 'Save failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = async (hash: string) => {
    setMessage(null);
    try {
      const res = await fetch('/api/soul', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, file, revertHash: hash }),
      });
      const data = await res.json();
      if (data.success) {
        setContent(data.content || '');
        setMessage({ type: 'success', text: `Reverted to ${hash.slice(0, 7)}` });
        fetchFile(agent, file);
      } else {
        setMessage({ type: 'error', text: data.error || 'Revert failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Revert failed' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>
        ✎ Soul Editor
      </h1>

      {/* Top bar: agent + file selector */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-md outline-none"
          style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border)',
            color: 'var(--grid-text)',
          }}
        >
          {agents.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {FILES.map((f) => (
            <button
              key={f}
              onClick={() => setFile(f)}
              className="text-xs px-3 py-1.5 rounded-md transition-colors"
              style={{
                background: file === f ? 'var(--grid-accent)' : 'var(--grid-surface)',
                color: file === f ? 'var(--grid-bg)' : 'var(--grid-text-dim)',
                border: `1px solid ${file === f ? 'var(--grid-accent)' : 'var(--grid-border)'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className="text-xs px-3 py-2 rounded-md"
          style={{
            background: message.type === 'success'
              ? 'color-mix(in srgb, var(--grid-accent) 15%, transparent)'
              : 'color-mix(in srgb, #ff4444 15%, transparent)',
            color: message.type === 'success' ? 'var(--grid-accent)' : '#ff6666',
            border: `1px solid ${message.type === 'success' ? 'var(--grid-accent)' : '#ff4444'}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Editor */}
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={loading ? 'Loading...' : 'File is empty. Start writing...'}
            className="w-full rounded-lg p-4 text-sm outline-none resize-y"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
              minHeight: 400,
              background: 'var(--grid-bg)',
              border: '1px solid var(--grid-border)',
              color: 'var(--grid-text)',
              lineHeight: 1.6,
            }}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="text-xs px-4 py-2 rounded-md font-medium transition-opacity"
              style={{
                background: 'var(--grid-accent)',
                color: 'var(--grid-bg)',
                opacity: saving || loading ? 0.5 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <span className="text-xs" style={{ color: 'var(--grid-text-muted)' }}>
              ⌘S to save
            </span>
          </div>
        </div>

        {/* Version History sidebar */}
        <div
          className="lg:w-72 rounded-lg p-4 space-y-3"
          style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border)',
          }}
        >
          <h2 className="text-xs font-bold tracking-wide uppercase" style={{ color: 'var(--grid-text-dim)' }}>
            Version History
          </h2>
          {history.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--grid-text-muted)' }}>No history available</p>
          ) : (
            history.map((entry) => (
              <div
                key={entry.hash}
                className="text-xs space-y-1 pb-2 border-b"
                style={{ borderColor: 'var(--grid-border)' }}
              >
                <div className="flex items-center justify-between">
                  <code
                    className="px-1 py-0.5 rounded text-[10px]"
                    style={{ background: 'var(--grid-bg)', color: 'var(--grid-accent)' }}
                  >
                    {entry.hash?.slice(0, 7)}
                  </code>
                  <button
                    onClick={() => handleRevert(entry.hash)}
                    className="text-[10px] px-2 py-0.5 rounded transition-opacity hover:opacity-80"
                    style={{
                      border: '1px solid var(--grid-border)',
                      color: 'var(--grid-text-dim)',
                    }}
                  >
                    Revert
                  </button>
                </div>
                <p style={{ color: 'var(--grid-text-dim)' }}>{entry.message}</p>
                <p style={{ color: 'var(--grid-text-muted)' }}>{entry.date}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
