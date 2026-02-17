'use client';

import { useEffect, useState } from 'react';

interface AgentStatus {
  id: string;
  name: string;
  emoji: string;
  active: boolean;
  lastActivity?: string;
}

interface FleetData {
  agents: AgentStatus[];
  summary: { total: number; active: number; idle: number; offline: number };
}

function dotColor(agent: AgentStatus): string {
  if (!agent.lastActivity) return 'var(--grid-text-dim, #6b7280)';
  const age = Date.now() - new Date(agent.lastActivity).getTime();
  if (age < 30_000) return 'var(--grid-success, #22c55e)';
  return 'var(--grid-warning, #f59e0b)';
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 w-24 rounded" style={{ background: 'var(--grid-bg)' }} />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-6 h-6 rounded-full" style={{ background: 'var(--grid-bg)' }} />
        ))}
      </div>
      <div className="h-3 w-40 rounded" style={{ background: 'var(--grid-bg)' }} />
    </div>
  );
}

export function FleetStatusWidget() {
  const [data, setData] = useState<FleetData | null>(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch('/api/fleet')
        .then((r) => r.json())
        .then((d) => active && setData(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 10_000);
    return () => { active = false; clearInterval(id); };
  }, []);

  if (!data) return <Skeleton />;

  const { agents, summary } = data;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {agents.map((a) => (
          <div
            key={a.id}
            title={`${a.emoji} ${a.name}`}
            className="w-6 h-6 rounded-full transition-colors cursor-default"
            style={{ background: dotColor(a) }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>
        <span style={{ color: 'var(--grid-success, #22c55e)' }}>{summary.active} active</span>
        {' · '}
        <span style={{ color: 'var(--grid-warning, #f59e0b)' }}>{summary.idle} idle</span>
        {' · '}
        <span>{summary.offline} offline</span>
      </p>
    </div>
  );
}
