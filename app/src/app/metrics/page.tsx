'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSprintData } from '@/hooks/use-sprint-data';

interface ActivityItem {
  agent: string;
  agentEmoji: string;
  agentName: string;
  sessionId: string;
  task: string;
  lastMessage: string;
  lastRole: string;
  timestamp: string;
  messageCount: number;
  status: 'active' | 'recent' | 'idle';
  durationMs?: number;
}

interface AgentStats {
  id: string;
  name: string;
  emoji: string;
  totalSessions: number;
  totalMessages: number;
  totalDurationMs: number;
  lastActive: string;
  status: 'active' | 'recent' | 'idle';
}

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s`;
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function MiniSprintBoard() {
  const { data, loading, error } = useSprintData();

  if (loading) {
    return (
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 p-5">
        <h2 className="text-lg font-bold tracking-wide mb-3">🏃 Current Sprint</h2>
        <div className="text-zinc-500 text-sm">Loading sprint data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 p-5">
        <h2 className="text-lg font-bold tracking-wide mb-3">🏃 Current Sprint</h2>
        <div className="text-red-400 text-sm">
          {error || 'Failed to load sprint data'}
        </div>
      </div>
    );
  }

  const progressPercentage = data.summary.total > 0 ? 
    Math.round((data.summary.done / data.summary.total) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done': return 'text-green-400';
      case 'in_progress': case 'in progress': return 'text-yellow-400';
      default: return 'text-zinc-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done': return '✅';
      case 'in_progress': case 'in progress': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-wide">🏃 Current Sprint</h2>
          <span className="text-xs text-zinc-600 font-mono">{data.projectName}</span>
        </div>
      </div>
      
      <div className="p-5">
        {/* Progress section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-zinc-300">
              Progress: {data.summary.done}/{data.summary.total} tasks completed
            </span>
            <span className="text-sm font-mono text-zinc-500">{progressPercentage}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Summary stats */}
          <div className="flex gap-4 mt-2 text-xs">
            {data.summary.done > 0 && (
              <span className="text-green-400">✅ {data.summary.done} done</span>
            )}
            {data.summary.inProgress > 0 && (
              <span className="text-yellow-400">🔄 {data.summary.inProgress} in progress</span>
            )}
            {data.summary.pending > 0 && (
              <span className="text-zinc-500">⏳ {data.summary.pending} pending</span>
            )}
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {data.tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2 p-2 rounded bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors">
              <span className="text-sm">{getStatusIcon(task.status)}</span>
              <span className="text-xs font-mono text-zinc-600 w-8">#{task.task_number}</span>
              <span className="flex-1 text-sm text-zinc-300 truncate">{task.title}</span>
              <span className={`text-xs font-mono uppercase ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      setActivity(data.activity ?? []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 10_000);
    return () => clearInterval(iv);
  }, [fetchData]);

  // Aggregate stats per agent
  const agentStats: AgentStats[] = [];
  const agentMap = new Map<string, AgentStats>();

  for (const item of activity) {
    let stats = agentMap.get(item.agent);
    if (!stats) {
      stats = {
        id: item.agent,
        name: item.agentName,
        emoji: item.agentEmoji,
        totalSessions: 0,
        totalMessages: 0,
        totalDurationMs: 0,
        lastActive: item.timestamp,
        status: item.status,
      };
      agentMap.set(item.agent, stats);
      agentStats.push(stats);
    }
    stats.totalSessions++;
    stats.totalMessages += item.messageCount;
    stats.totalDurationMs += item.durationMs ?? 0;
    if (item.timestamp > stats.lastActive) {
      stats.lastActive = item.timestamp;
      stats.status = item.status;
    }
  }

  agentStats.sort((a, b) => b.totalMessages - a.totalMessages);

  const totalSessions = activity.length;
  const totalMessages = activity.reduce((s, a) => s + a.messageCount, 0);
  const activeNow = activity.filter(a => a.status === 'active').length;
  const totalDuration = activity.reduce((s, a) => s + (a.durationMs ?? 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-wide">Team Metrics</h1>
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wide">📊 Team Metrics</h1>
        <span className="text-xs text-zinc-600 font-mono">Last 24h • Auto-refresh 10s</span>
      </div>

      {/* Mini Sprint Board */}
      <MiniSprintBoard />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Active Now" value={String(activeNow)} accent={activeNow > 0 ? 'green' : 'zinc'} icon="🟢" />
        <MetricCard label="Sessions (24h)" value={String(totalSessions)} accent="purple" icon="💬" />
        <MetricCard label="Total Messages" value={String(totalMessages)} accent="blue" icon="📨" />
        <MetricCard label="Total Runtime" value={formatDuration(totalDuration)} accent="amber" icon="⏱️" />
      </div>

      {/* Agent Leaderboard */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold tracking-wide">Agent Activity Leaderboard</h2>
        </div>
        {agentStats.length === 0 ? (
          <div className="p-6 text-center text-zinc-600 text-sm">No agent activity in the last 24h</div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {agentStats.map((agent, i) => {
              const maxMessages = agentStats[0]?.totalMessages || 1;
              const barWidth = (agent.totalMessages / maxMessages) * 100;
              return (
                <div key={agent.id} className="px-5 py-3 flex items-center gap-4 hover:bg-zinc-800/20 transition-colors">
                  <span className="text-zinc-600 text-sm font-mono w-6 text-right">#{i + 1}</span>
                  <span className="text-xl w-8 text-center">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{agent.name}</span>
                      <StatusDot status={agent.status} />
                    </div>
                    {/* Bar chart */}
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: agent.status === 'active' ? '#22c55e' : agent.status === 'recent' ? '#eab308' : '#3f3f46',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono flex-shrink-0">
                    <span title="Sessions">{agent.totalSessions} sess</span>
                    <span title="Messages">{agent.totalMessages} msg</span>
                    {agent.totalDurationMs > 0 && (
                      <span title="Runtime">{formatDuration(agent.totalDurationMs)}</span>
                    )}
                    <span className="text-zinc-600" title="Last active">{timeAgo(agent.lastActive)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Sessions Timeline */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold tracking-wide">Recent Sessions</h2>
        </div>
        <div className="divide-y divide-zinc-800/50 max-h-[500px] overflow-y-auto">
          {activity.slice(0, 15).map((item) => (
            <div key={item.sessionId} className="px-5 py-3 hover:bg-zinc-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.agentEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm">{item.agentName}</span>
                    <StatusDot status={item.status} />
                    <span className="text-[10px] text-zinc-600 font-mono ml-auto">
                      {timeAgo(item.timestamp)}
                      {item.durationMs ? ` • ${formatDuration(item.durationMs)}` : ''}
                      {` • ${item.messageCount} msgs`}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {item.task.replace(/^You are [A-Z]+[^.]*\.\s*/i, '').slice(0, 150)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent, icon }: { label: string; value: string; accent: string; icon: string }) {
  const colors: Record<string, string> = {
    green: 'border-green-500/30 text-green-400',
    purple: 'border-purple-500/30 text-purple-400',
    blue: 'border-blue-500/30 text-blue-400',
    amber: 'border-amber-500/30 text-amber-400',
    zinc: 'border-zinc-700 text-zinc-400',
  };
  const c = colors[accent] ?? colors.zinc;
  return (
    <div className={`border rounded-lg p-4 bg-zinc-900/30 ${c.split(' ')[0]}`}>
      <div className="text-xs text-zinc-500 mb-1">{icon} {label}</div>
      <div className={`text-2xl font-bold font-mono ${c.split(' ')[1]}`}>{value}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const cls = status === 'active' ? 'bg-green-500 animate-pulse' : status === 'recent' ? 'bg-yellow-500' : 'bg-zinc-600';
  return <span className={`w-1.5 h-1.5 rounded-full ${cls}`} />;
}