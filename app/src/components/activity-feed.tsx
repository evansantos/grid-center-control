'use client';

import { useState, useEffect, useCallback } from 'react';
import { timeAgo, formatDuration } from '@/lib/time-utils';

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

function formatEventDescription(item: ActivityItem): string {
  const dur = item.durationMs ? formatDuration(item.durationMs, { compact: true }) : '';
  const msgs = `${item.messageCount} msgs`;
  const durPart = dur ? `, ${dur}` : '';

  if (item.status === 'active') {
    return `${item.agentEmoji} ${item.agentName} is working (${msgs}${durPart})`;
  }

  // Try to infer action from task
  const task = item.task.toLowerCase();
  if (task.includes('sprint') || task.includes('frontend') || task.includes('build')) {
    return `⚡ ${item.agentName} completed frontend work (${msgs}${durPart})`;
  }
  if (task.includes('orchestrat') || task.includes('spawn')) {
    return `🔴 ${item.agentName} orchestrated a session (${msgs}${durPart})`;
  }
  if (task.includes('security') || task.includes('audit')) {
    return `🛡️ ${item.agentName} ran security audit (${msgs}${durPart})`;
  }
  if (task.includes('design') || task.includes('pixel')) {
    return `🎨 ${item.agentName} delivered designs (${msgs}${durPart})`;
  }

  return `${item.agentEmoji} ${item.agentName} session (${msgs}${durPart})`;
}

function truncateTask(task: string, maxLen = 120): string {
  const cleaned = task.replace(/^You are [A-Z]+[^.]*\.\s*/i, '').replace(/\n/g, ' ').trim();
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + '…' : cleaned;
}

const statusColors = {
  active: { dot: 'bg-green-500 animate-pulse', text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/5' },
  recent: { dot: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5' },
  idle: { dot: 'bg-zinc-600', text: 'text-zinc-500', border: 'border-zinc-800', bg: '' },
};

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      setItems(data.activity ?? []);
    } catch (e) {
      console.error('Failed to fetch activity', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 5000);
    return () => clearInterval(interval);
  }, [fetchActivity]);

  // Unique agents for filter
  const agents = Array.from(new Set(items.map(i => i.agent)));
  const filtered = agentFilter === 'all' ? items : items.filter(i => i.agent === agentFilter);

  const activeCount = items.filter(i => i.status === 'active').length;
  const recentCount = items.filter(i => i.status === 'recent').length;

  if (loading) {
    return (
      <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/30">
        <div className="text-zinc-500 text-sm animate-pulse">Loading activity...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900/30">
        <h2 className="text-lg font-bold mb-2 tracking-wide">Activity Feed</h2>
        <p className="text-zinc-600 text-sm">No recent agent activity in the last 24h.</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 rounded-lg p-5 bg-zinc-900/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold tracking-wide">Activity Feed</h2>
        <div className="flex items-center gap-3 text-xs">
          {activeCount > 0 && (
            <span className="flex items-center gap-1.5 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {activeCount} active
            </span>
          )}
          {recentCount > 0 && (
            <span className="flex items-center gap-1.5 text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              {recentCount} recent
            </span>
          )}
          <span className="text-zinc-600">{filtered.length} events</span>
        </div>
      </div>

      {/* Agent filter */}
      {agents.length > 1 && (
        <div className="flex gap-1.5 mb-3 flex-wrap">
          <button
            onClick={() => setAgentFilter('all')}
            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border transition-colors ${
              agentFilter === 'all'
                ? 'border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
            }`}
          >All</button>
          {agents.map(a => {
            const meta = items.find(i => i.agent === a);
            return (
              <button
                key={a}
                onClick={() => setAgentFilter(a)}
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border transition-colors ${
                  agentFilter === a
                    ? 'border-red-500/40 bg-red-500/10 text-red-400'
                    : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                }`}
              >{meta?.agentEmoji} {meta?.agentName ?? a}</button>
            );
          })}
        </div>
      )}

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filtered.map((item) => {
          const colors = statusColors[item.status];
          const isExpanded = expandedId === item.sessionId;
          return (
            <div
              key={item.sessionId}
              className={`border ${colors.border} rounded-lg ${colors.bg} transition-all cursor-pointer hover:border-zinc-600`}
              onClick={() => setExpandedId(isExpanded ? null : item.sessionId)}
            >
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{item.agentEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{item.agentName}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      <span className={`text-[10px] uppercase font-medium ${colors.text}`}>
                        {item.status}
                      </span>
                      <span className="text-[10px] text-zinc-600 ml-auto flex-shrink-0">
                        {timeAgo(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mb-0.5">
                      {formatEventDescription(item)}
                    </div>
                    {!isExpanded && (
                      <div className="text-[11px] text-zinc-600 line-clamp-1">
                        {truncateTask(item.task)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-zinc-800/50 pt-2 space-y-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-zinc-600 mb-1">Task</div>
                    <div className="text-xs text-zinc-400 whitespace-pre-wrap">
                      {item.task}
                    </div>
                  </div>
                  {item.lastMessage && item.lastRole === 'assistant' && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-600 mb-1">Last Response</div>
                      <div className="text-[11px] text-zinc-500 border-l-2 border-red-500/30 pl-2 whitespace-pre-wrap">
                        {item.lastMessage}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 text-[10px] text-zinc-600">
                    <span>💬 {item.messageCount} messages</span>
                    {item.durationMs && <span>⏱ {formatDuration(item.durationMs)}</span>}
                    <span className="text-zinc-700">#{item.sessionId.slice(0, 8)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}