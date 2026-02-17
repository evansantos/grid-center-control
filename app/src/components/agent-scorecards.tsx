'use client';

import { useState, useEffect } from 'react';

interface AgentScorecard {
  agentId: string;
  emoji: string;
  sessionsCount: number;
  totalTokensIn: number;
  totalTokensOut: number;
  avgDurationSec: number;
  errorCount: number;
  errorRate: number;
  lastActive: string;
  trend: number[];
  health: 'healthy' | 'watch' | 'issues';
}

type SortKey = 'sessions' | 'tokens' | 'errors';

const HEALTH_COLORS = {
  healthy: 'border-green-800/50 bg-green-900/10',
  watch: 'border-yellow-800/50 bg-yellow-900/10',
  issues: 'border-red-800/50 bg-red-900/10',
};

const HEALTH_DOT = {
  healthy: 'bg-green-500',
  watch: 'bg-yellow-500',
  issues: 'bg-red-500',
};

function Sparkline({ data }: { data: number[] }) {
  if (data.length === 0 || data.every(d => d === 0)) {
    return <div className="h-8 w-full" />;
  }
  const max = Math.max(...data, 1);
  const h = 32, w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 4)}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-green-500" />
    </svg>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m`;
}

function timeAgo(ts: string): string {
  if (!ts || ts === 'never') return 'never';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AgentScorecards() {
  const [cards, setCards] = useState<AgentScorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('sessions');

  useEffect(() => {
    fetch('/api/analytics/performance')
      .then(r => r.json())
      .then(setCards)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...cards].sort((a, b) => {
    if (sortBy === 'tokens') return (b.totalTokensIn + b.totalTokensOut) - (a.totalTokensIn + a.totalTokensOut);
    if (sortBy === 'errors') return b.errorCount - a.errorCount;
    return b.sessionsCount - a.sessionsCount;
  });

  if (loading) return <div className="text-zinc-500 text-sm animate-pulse">Loading scorecards...</div>;
  if (cards.length === 0) return <div className="text-center py-12 text-zinc-600 text-sm">No agent data found</div>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['sessions', 'tokens', 'errors'] as SortKey[]).map(k => (
          <button
            key={k}
            onClick={() => setSortBy(k)}
            className={`text-xs px-3 py-1 rounded ${sortBy === k ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {k === 'sessions' ? 'Most Active' : k === 'tokens' ? 'Highest Cost' : 'Most Errors'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(card => (
          <div key={card.agentId} className={`border rounded-lg p-4 ${HEALTH_COLORS[card.health]}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{card.emoji}</span>
                <span className="text-sm font-medium text-zinc-200 capitalize">{card.agentId}</span>
                <span className={`w-2 h-2 rounded-full ${HEALTH_DOT[card.health]}`} />
              </div>
              <Sparkline data={card.trend} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <span className="text-zinc-500">Sessions</span>
              <span className="text-zinc-300 text-right font-mono">{card.sessionsCount}</span>
              <span className="text-zinc-500">Tokens</span>
              <span className="text-zinc-300 text-right font-mono">{formatTokens(card.totalTokensIn + card.totalTokensOut)}</span>
              <span className="text-zinc-500">Avg Duration</span>
              <span className="text-zinc-300 text-right font-mono">{formatDuration(card.avgDurationSec)}</span>
              <span className="text-zinc-500">Error Rate</span>
              <span className={`text-right font-mono ${card.errorRate > 20 ? 'text-red-400' : card.errorRate > 5 ? 'text-yellow-400' : 'text-zinc-300'}`}>
                {card.errorRate}%
              </span>
              <span className="text-zinc-500">Last Active</span>
              <span className="text-zinc-300 text-right">{timeAgo(card.lastActive)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
