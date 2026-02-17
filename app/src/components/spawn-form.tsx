'use client';

import { useState, useEffect } from 'react';

interface AgentOption {
  id: string;
  emoji: string;
  name: string;
}

interface SpawnResult {
  sessionKey: string;
  agentId: string;
  model: string;
  status: string;
  timestamp: string;
}

const MODELS = [
  { id: 'default', label: 'Default' },
  { id: 'opus', label: 'Claude Opus' },
  { id: 'sonnet', label: 'Claude Sonnet' },
  { id: 'gpt4o', label: 'GPT-4o' },
];

export function SpawnForm() {
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [agentId, setAgentId] = useState('');
  const [model, setModel] = useState('default');
  const [task, setTask] = useState('');
  const [timeout, setTimeout_] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SpawnResult | null>(null);
  const [recentSpawns, setRecentSpawns] = useState<SpawnResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/spawn').then(r => r.json()).then(d => {
      setAgents(d.agents || []);
      if (d.agents?.length) setAgentId(d.agents[0].id);
    }).catch(() => {});

    try {
      const stored = localStorage.getItem('grid-recent-spawns');
      if (stored) setRecentSpawns(JSON.parse(stored));
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, model, task, timeoutSeconds: timeout }),
      });
      const data = await res.json();
      setResult(data);

      const updated = [data, ...recentSpawns].slice(0, 10);
      setRecentSpawns(updated);
      localStorage.setItem('grid-recent-spawns', JSON.stringify(updated));
      setTask('');
    } catch {
      setError('Failed to spawn agent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === agentId);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Agent</label>
            <select
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Task Description</label>
          <textarea
            value={task}
            onChange={e => setTask(e.target.value)}
            required
            rows={4}
            placeholder="Describe the task for the agent..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500 resize-none"
          />
        </div>

        <div className="flex items-end gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Timeout (seconds)</label>
            <input
              type="number"
              value={timeout}
              onChange={e => setTimeout_(Number(e.target.value))}
              min={30}
              max={3600}
              className="w-32 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !task.trim()}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded text-sm font-medium transition-colors"
          >
            {submitting ? '⏳ Spawning...' : `🚀 Spawn ${selectedAgent?.name || 'Agent'}`}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </form>

      {result && (
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-400 mb-2">✅ Agent Spawned</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="text-zinc-500">Session</span>
            <span className="text-zinc-300 font-mono">{result.sessionKey.slice(-20)}</span>
            <span className="text-zinc-500">Agent</span>
            <span className="text-zinc-300">{result.agentId}</span>
            <span className="text-zinc-500">Model</span>
            <span className="text-zinc-300">{result.model}</span>
            <span className="text-zinc-500">Status</span>
            <span className="text-zinc-300">{result.status}</span>
          </div>
        </div>
      )}

      {recentSpawns.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Recent Spawns</h3>
          <div className="space-y-2">
            {recentSpawns.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 rounded px-4 py-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-300 font-medium">{s.agentId}</span>
                  <span className="text-zinc-600 font-mono">{s.sessionKey.slice(-12)}</span>
                </div>
                <span className="text-zinc-600">{new Date(s.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
