'use client';

import { useState, useEffect, useCallback } from 'react';

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  activeSessions: { sessionKey: string; messageCount: number }[];
}

interface ActivityItem {
  agent: string;
  messageCount: number;
  status: 'active' | 'recent' | 'idle';
}

export function DashboardStats() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [agRes, actRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/activity'),
      ]);
      const agData = await agRes.json();
      const actData = await actRes.json();
      setAgents(agData.agents ?? []);
      setActivity(actData.activity ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 15_000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const activeAgents = agents.filter(a => a.activeSessions.length > 0).length;
  const totalSessions = activity.length;
  const totalMessages = activity.reduce((s, a) => s + a.messageCount, 0);
  const teamSize = agents.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard icon="🟢" label="Active Agents" value={String(activeAgents)} accent="green" />
      <StatCard icon="💬" label="Sessions (24h)" value={String(totalSessions)} accent="purple" />
      <StatCard icon="📨" label="Messages" value={String(totalMessages)} accent="blue" />
      <StatCard icon="👥" label="Team Size" value={String(teamSize)} accent="amber" />
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  const borderColors: Record<string, string> = {
    green: 'border-green-500/30',
    purple: 'border-purple-500/30',
    blue: 'border-blue-500/30',
    amber: 'border-amber-500/30',
  };
  const textColors: Record<string, string> = {
    green: 'text-green-400',
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
  };

  return (
    <div className={`border rounded-lg p-4 bg-zinc-900/30 ${borderColors[accent] ?? 'border-zinc-700'}`}>
      <div className="text-xs text-zinc-500 mb-1">{icon} {label}</div>
      <div className={`text-2xl font-bold font-mono ${textColors[accent] ?? 'text-zinc-400'}`}>{value}</div>
    </div>
  );
}
