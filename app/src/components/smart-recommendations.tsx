'use client';

import { useState, useEffect, useCallback } from 'react';

interface ActivityItem {
  agent: string;
  agentEmoji: string;
  agentName: string;
  status: 'active' | 'recent' | 'idle';
  task: string;
  lastMessage: string;
  timestamp: string;
}

interface Recommendation {
  id: string;
  icon: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

const DISMISS_KEY = 'smart-recommendations-dismissed';
const DISMISS_TTL = 60 * 60 * 1000; // 1 hour

function getDismissed(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    const now = Date.now();
    const cleaned: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (now - v < DISMISS_TTL) cleaned[k] = v;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function dismiss(id: string) {
  const current = getDismissed();
  current[id] = Date.now();
  localStorage.setItem(DISMISS_KEY, JSON.stringify(current));
}

function generateRecommendations(activity: ActivityItem[]): Recommendation[] {
  const recs: Recommendation[] = [];

  const specAgent = activity.find(a => a.agent.toLowerCase().includes('spec'));
  const devAgent = activity.find(a => a.agent.toLowerCase().includes('dev'));
  const bugAgent = activity.find(a => a.agent.toLowerCase().includes('bug'));

  // Rule 1: SPEC idle + tasks in backlog → suggest assign
  if (specAgent && specAgent.status === 'idle') {
    recs.push({
      id: 'spec-idle-assign',
      icon: '📋',
      message: `${specAgent.agentName} is idle. Consider assigning backlog tasks to keep the pipeline flowing.`,
      actionLabel: 'View Tasks',
      onAction: () => window.location.href = '/tasks',
    });
  }

  // Rule 2: DEV done → BUG should review
  if (devAgent && devAgent.status === 'idle' && devAgent.lastMessage.toLowerCase().match(/done|complete|finish|merged/)) {
    recs.push({
      id: 'dev-done-bug-review',
      icon: '🔍',
      message: `${devAgent.agentName} appears to have finished work. ${bugAgent?.agentName ?? 'BUG'} should review the output.`,
      actionLabel: 'Notify Review',
      onAction: () => alert('Review notification sent'),
    });
  }

  // Rule 3: High activity today → suggest cheaper model
  const activeCount = activity.filter(a => a.status === 'active').length;
  if (activeCount >= 3) {
    recs.push({
      id: 'high-cost-cheaper-model',
      icon: '💰',
      message: `${activeCount} agents active simultaneously. Consider switching lower-priority agents to a cheaper model to reduce costs.`,
      actionLabel: 'Review Models',
      onAction: () => alert('Model configuration opened'),
    });
  }

  // Rule 4: Agent stuck (active for a long time with many messages)
  for (const agent of activity) {
    if (agent.status === 'active') {
      const age = Date.now() - new Date(agent.timestamp).getTime();
      if (age > 30 * 60 * 1000) {
        recs.push({
          id: `stuck-${agent.agent}`,
          icon: '⚠️',
          message: `${agent.agentName} has been active for over 30 minutes. It may be stuck or in a loop.`,
          actionLabel: 'Check Session',
          onAction: () => window.location.href = `/agents/${agent.agent}`,
        });
      }
    }
  }

  return recs;
}

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dismissed, setDismissed] = useState<Record<string, number>>({});
  const [collapsed, setCollapsed] = useState(false);

  const fetchAndGenerate = useCallback(async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      const recs = generateRecommendations(data.activity ?? []);
      setRecommendations(recs);
      setDismissed(getDismissed());
    } catch {}
  }, []);

  useEffect(() => {
    fetchAndGenerate();
    const interval = setInterval(fetchAndGenerate, 30000);
    return () => clearInterval(interval);
  }, [fetchAndGenerate]);

  const handleDismiss = (id: string) => {
    dismiss(id);
    setDismissed(getDismissed());
  };

  const visible = recommendations.filter(r => !dismissed[r.id]);

  if (visible.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
          <span>💡</span> Smart Recommendations
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{visible.length}</span>
        </h3>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-500 hover:text-zinc-300 text-xs"
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      {!collapsed && (
        <div className="space-y-2">
          {visible.map(rec => (
            <div
              key={rec.id}
              className="flex items-start gap-3 bg-zinc-800 rounded-md p-3 border border-zinc-700"
            >
              <span className="text-lg mt-0.5">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300">{rec.message}</p>
                <button
                  onClick={rec.onAction}
                  className="mt-2 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded transition-colors"
                >
                  {rec.actionLabel}
                </button>
              </div>
              <button
                onClick={() => handleDismiss(rec.id)}
                className="text-zinc-500 hover:text-zinc-300 text-sm flex-shrink-0"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
