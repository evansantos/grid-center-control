'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
        <h1 className="text-2xl font-bold tracking-wide mb-2 text-grid-text">
          Agents
        </h1>
        <p className="text-[length:var(--font-size-sm)] text-grid-text-muted">
          Manage your development agents and their configurations
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 rounded-full border-grid-border border-t-grid-accent" />
            <span className="ml-3 text-[length:var(--font-size-sm)] text-grid-text-muted">
              Scanning agents…
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      )}

      {error && (
        <Card variant="accent" className="p-4 border-grid-error text-grid-error">
          <p className="text-[length:var(--font-size-sm)]">
            Failed to load agents: {error}
          </p>
        </Card>
      )}

      {!loading && !error && agents.length === 0 && (
        <Card className="p-4 text-center">
          <p className="text-[length:var(--font-size-sm)] text-grid-text-muted">
            No agents found in <code>~/.openclaw/agents/</code>
          </p>
        </Card>
      )}

      {!loading && !error && agents.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const status = getStatus(agent);
            const sessionCount = agent.activeSessions.length;
            const avatar = agent.emoji || agent.name.charAt(0).toUpperCase();

            return (
              <Card key={agent.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-grid-text">
                      {agent.name}
                    </h3>
                    <p className="text-[length:var(--font-size-sm)] text-grid-text-muted">
                      {agent.role || agent.id}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-grid-accent/20 text-grid-accent">
                    {avatar}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4 text-[length:var(--font-size-xs)] text-grid-text-muted">
                  <span className="flex items-center gap-1">
                    <StatusDot status={status === 'active' ? 'active' : 'idle'} size="sm" />
                    {status === 'active' ? 'Active' : 'Idle'}
                  </span>
                  <span>{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2">
                  <Link href={`/agents/${agent.id}/config`} className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                      Configure
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
