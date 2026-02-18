'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeatmapDay {
  date: string;
  count: number;
}

interface AgentBreakdown {
  agentId: string;
  count: number;
}

interface ModelBreakdown {
  model: string;
  count: number;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  deletedSessions: number;
  busiestDay: { date: string; count: number };
  avgPerDay: number;
  currentStreak: number;
  peakHours: number[];
  agentBreakdown: AgentBreakdown[];
  modelBreakdown: ModelBreakdown[];
  totalTokensIn: number;
  totalTokensOut: number;
  avgSessionDurationSec: number;
}

interface SessionAnalytics {
  heatmap: HeatmapDay[];
  stats: SessionStats;
}

const AGENT_EMOJIS: Record<string, string> = {
  main: '👤', grid: '🔴', dev: '💻', bug: '🐛', arch: '🏛️',
  sentinel: '🛡️', pixel: '🎨', scribe: '📝', sage: '🧙',
  atlas: '🗺️', riff: '🎵', vault: '🔐', spec: '📋', ceo: '👔',
};

export default function SessionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSessionData = async () => {
    try {
      const response = await fetch('/api/analytics/sessions');
      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch session data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchSessionData();
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading && !analytics) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="Session Analytics"
          description="Loading session data..."
          icon="📅"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-grid-surface-hover rounded mb-2" />
                <div className="h-8 bg-grid-surface-hover rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = analytics?.stats;
  const heatmap = analytics?.heatmap || [];

  // Get last 30 days for mini heatmap
  const recentHeatmap = heatmap.slice(-30);
  const maxCount = Math.max(...recentHeatmap.map(d => d.count), 1);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Session Analytics"
        description="Monitor sessions, analyze patterns, and track engagement metrics"
        icon="📅"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-grid-text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button variant="default" size="sm" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        }
      />

      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="📊"
          label="Total Sessions"
          value={stats?.totalSessions ?? 0}
          variant="info"
        />
        <StatCard
          icon="🟢"
          label="Active Sessions"
          value={stats?.activeSessions ?? 0}
          variant="success"
        />
        <StatCard
          icon="⏱️"
          label="Avg Duration"
          value={stats?.avgSessionDurationSec ? formatDuration(stats.avgSessionDurationSec) : '0s'}
          variant="default"
        />
        <StatCard
          icon="📈"
          label="Avg Per Day"
          value={stats?.avgPerDay?.toFixed(1) ?? '0'}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Heatmap */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-grid-text">Activity (Last 30 Days)</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {recentHeatmap.map((day) => (
                <div
                  key={day.date}
                  className="w-4 h-4 rounded-sm cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: day.count === 0 
                      ? 'var(--grid-surface-hover)' 
                      : `rgba(239, 68, 68, ${0.2 + (day.count / maxCount) * 0.8})`,
                  }}
                  title={`${day.date}: ${day.count} sessions`}
                />
              ))}
            </div>
            {stats?.busiestDay && (
              <p className="mt-4 text-sm text-grid-text-muted">
                Busiest day: <span className="text-grid-text">{stats.busiestDay.date}</span> ({stats.busiestDay.count} sessions)
              </p>
            )}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-grid-text">Peak Hours</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-24">
              {Array.from({ length: 24 }, (_, hour) => {
                const isPeak = stats?.peakHours?.includes(hour);
                return (
                  <div
                    key={hour}
                    className="flex-1 rounded-t transition-all"
                    style={{
                      height: isPeak ? '100%' : '20%',
                      backgroundColor: isPeak ? 'var(--grid-accent)' : 'var(--grid-surface-hover)',
                    }}
                    title={`${hour}:00 - ${hour + 1}:00${isPeak ? ' (peak)' : ''}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-grid-text-muted">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-grid-text">Sessions by Agent</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.agentBreakdown?.slice(0, 10).map((agent) => (
                <div key={agent.agentId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{AGENT_EMOJIS[agent.agentId] || '❓'}</span>
                    <span className="font-mono text-sm uppercase text-grid-text">{agent.agentId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-grid-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-grid-accent rounded-full"
                        style={{ width: `${(agent.count / (stats?.totalSessions || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-grid-text-muted w-8 text-right">{agent.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Model Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-grid-text">Sessions by Model</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.modelBreakdown?.slice(0, 8).map((model) => (
                <div key={model.model} className="flex items-center justify-between">
                  <span className="font-mono text-sm text-grid-text truncate max-w-[180px]">{model.model}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm">{model.count}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
