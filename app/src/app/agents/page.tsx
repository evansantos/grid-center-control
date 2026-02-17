'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  model: string;
  activeSessions: { sessionKey: string; updatedAt?: string; messageCount: number }[];
}

function getStatus(agent: AgentInfo): 'active' | 'idle' {
  const now = Date.now();
  const recentCutoff = 30 * 60 * 1000; // 30 minutes
  return agent.activeSessions.some(
    (s) => s.updatedAt && now - new Date(s.updatedAt).getTime() < recentCutoff
  )
    ? 'active'
    : 'idle';
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setAgents(data.agents ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-wide mb-2" style={{ color: 'var(--grid-text)' }}>
          Agents
        </h1>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          Manage your development agents and their configurations
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin w-6 h-6 border-2 rounded-full"
            style={{ borderColor: 'var(--grid-border)', borderTopColor: 'var(--grid-accent)' }}
          />
          <span className="ml-3 text-sm" style={{ color: 'var(--grid-text-dim)' }}>
            Scanning agents…
          </span>
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-lg border text-sm"
          style={{ borderColor: 'var(--grid-error, #e53e3e)', color: 'var(--grid-error, #e53e3e)', background: 'var(--grid-surface)' }}
        >
          Failed to load agents: {error}
        </div>
      )}

      {!loading && !error && agents.length === 0 && (
        <div className="p-4 rounded-lg text-center text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          No agents found in <code>~/.openclaw/agents/</code>
        </div>
      )}

      {!loading && !error && agents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const status = getStatus(agent);
            const sessionCount = agent.activeSessions.length;
            const avatar = agent.emoji || agent.name.charAt(0).toUpperCase();

            return (
              <div
                key={agent.id}
                className="p-6 rounded-lg border"
                style={{
                  background: 'var(--grid-surface)',
                  borderColor: 'var(--grid-border)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--grid-text)' }}>
                      {agent.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
                      {agent.role || agent.id}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{
                      background: 'var(--grid-accent)20',
                      color: 'var(--grid-accent)',
                    }}
                  >
                    {avatar}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 text-xs" style={{ color: 'var(--grid-text-dim)' }}>
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{
                        background: status === 'active' ? 'var(--grid-success, #48bb78)' : 'var(--grid-text-dim)',
                      }}
                    />
                    {status === 'active' ? 'Active' : 'Idle'}
                  </span>
                  <span>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/agents/${agent.id}/config`}
                    className="block w-full text-center py-2 px-4 text-sm rounded border hover:opacity-80 transition-opacity"
                    style={{
                      borderColor: 'var(--grid-border)',
                      color: 'var(--grid-text)',
                    }}
                  >
                    Configure
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
