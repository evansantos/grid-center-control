'use client';

import { useState, useEffect, useCallback } from 'react';

interface SubagentInfo {
  sessionKey: string;
  agentId: string;
  status: 'running' | 'completed' | 'error' | 'unknown';
  parentSession: string | null;
  task: string;
  runtime: number;
  startedAt: string;
  children: SubagentInfo[];
}

const STATUS_COLORS: Record<string, string> = {
  running: 'bg-green-500 animate-pulse',
  completed: 'bg-blue-500',
  error: 'bg-red-500',
  unknown: 'bg-zinc-500',
};

function formatRuntime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  return `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
}

function TreeNode({ agent, depth = 0 }: { agent: SubagentInfo; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const [steering, setSteering] = useState(false);
  const [steerMsg, setSteerMsg] = useState('');
  const [confirmKill, setConfirmKill] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSteer = async () => {
    if (!steerMsg.trim()) return;
    try {
      await fetch('/api/subagents/steer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionKey: agent.sessionKey, message: steerMsg }),
      });
      setSteerMsg('');
      setSteering(false);
    } catch {
      setError('Failed to steer agent');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleKill = async () => {
    try {
      // Placeholder
      console.log(`[KILL] ${agent.sessionKey}`);
      setConfirmKill(false);
    } catch {
      setError('Failed to kill agent');
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-zinc-800 pl-4' : ''}>
      <div className="flex items-start gap-3 py-2 group">
        {agent.children.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-zinc-500 hover:text-zinc-300 mt-1 text-xs w-4"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
        {agent.children.length === 0 && <span className="w-4" />}

        <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${STATUS_COLORS[agent.status]}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-zinc-200 font-medium">{agent.agentId}</span>
            <span className="text-xs text-zinc-600 font-mono">{agent.sessionKey.slice(-12)}</span>
            <span className="text-xs text-zinc-500">{formatRuntime(agent.runtime)}</span>
          </div>
          <p className="text-xs text-zinc-500 truncate mt-0.5">{agent.task || 'No task info'}</p>

          {steering && (
            <div className="flex gap-2 mt-2">
              <input
                value={steerMsg}
                onChange={e => setSteerMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSteer()}
                placeholder="Steer message..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              <button onClick={handleSteer} className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white">Send</button>
              <button onClick={() => setSteering(false)} className="text-xs px-2 py-1 text-zinc-500 hover:text-zinc-300">✕</button>
            </div>
          )}

          {confirmKill && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-red-400">Kill this agent?</span>
              <button onClick={handleKill} className="px-2 py-0.5 bg-red-600 hover:bg-red-500 rounded text-white">Yes</button>
              <button onClick={() => setConfirmKill(false)} className="text-zinc-500 hover:text-zinc-300">Cancel</button>
            </div>
          )}

          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setSteering(!steering)}
            className="text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
          >
            Steer
          </button>
          <button
            onClick={() => setConfirmKill(true)}
            className="text-xs px-2 py-0.5 rounded bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400"
          >
            Kill
          </button>
        </div>
      </div>

      {expanded && agent.children.map(child => (
        <TreeNode key={child.sessionKey} agent={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function SubagentTree() {
  const [agents, setAgents] = useState<SubagentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/subagents');
      const data = await res.json();
      setAgents(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    const iv = setInterval(fetchAgents, 15_000);
    return () => clearInterval(iv);
  }, [fetchAgents]);

  if (loading) {
    return <div className="text-zinc-500 text-sm animate-pulse">Loading sub-agents...</div>;
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-600">
        <p className="text-4xl mb-3">🌳</p>
        <p className="text-sm">No active sub-agents</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      {agents.map(agent => (
        <TreeNode key={agent.sessionKey} agent={agent} />
      ))}
    </div>
  );
}
