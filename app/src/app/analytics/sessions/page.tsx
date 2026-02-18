'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeatmapEntry {
  date: string;
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
  agentBreakdown: { agentId: string; count: number }[];
  modelBreakdown: { model: string; count: number }[];
  totalTokensIn: number;
  totalTokensOut: number;
  avgSessionDurationSec: number;
}

interface SessionApiResponse {
  heatmap: HeatmapEntry[];
  stats: SessionStats;
}

export default function SessionAnalyticsPage() {
  const [data, setData] = useState<SessionApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSessionData = async () => {
    try {
      const response = await fetch('/api/analytics/sessions');
      const result = await response.json();
      setData(result);
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

  const formatNumber = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // Get recent heatmap data (last 30 days)
  const recentHeatmap = data?.heatmap?.slice(-30) || [];
  const maxCount = Math.max(...recentHeatmap.map(d => d.count), 1);

  if (loading && !data) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="Session Analytics"
          description="Loading session data and statistics..."
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

  const stats = data?.stats;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Session Analytics"
        description="Monitor session patterns, agent activity, and engagement metrics"
        icon="📅"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-grid-text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading}>
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
          value={formatDuration(stats?.avgSessionDurationSec ?? 0)}
          variant="default"
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${stats?.currentStreak ?? 0} days`}
          variant="warning"
        />
      </div>

      {/* Activity Heatmap */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-grid-text">Activity Heatmap (Last 30 Days)</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {recentHeatmap.map((day) => {
              const intensity = day.count / maxCount;
              const bgClass = day.count === 0 
                ? 'bg-grid-surface-hover' 
                : intensity > 0.75 
                  ? 'bg-green-500' 
                  : intensity > 0.5 
                    ? 'bg-green-400' 
                    : intensity > 0.25 
                      ? 'bg-green-300' 
                      : 'bg-green-200';
              return (
                <div
                  key={day.date}
                  className={`w-4 h-4 rounded-sm ${bgClass}`}
                  title={`${day.date}: ${day.count} sessions`}
                />
              );
            })}
          </div>
          {stats?.busiestDay && (
            <p className="text-xs text-grid-text-muted mt-3">
              Busiest day: {stats.busiestDay.date} ({stats.busiestDay.count} sessions)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Agent & Model Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Agent Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-grid-text">Sessions by Agent</h2>
          </CardHeader>
          <CardContent>
            {stats?.agentBreakdown && stats.agentBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.agentBreakdown.slice(0, 10).map((agent) => (
                  <div key={agent.agentId} className="flex items-center justify-between">
                    <span className="font-mono text-sm text-grid-text">{agent.agentId}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-grid-surface-hover rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-grid-accent rounded-full"
                          style={{ width: `${(agent.count / stats.totalSessions) * 100}%` }}
                        />
                      </div>
                      <Badge variant="default" size="sm">{agent.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-grid-text-muted text-center py-4">No agent data</p>
            )}
          </CardContent>
        </Card>

        {/* Model Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-grid-text">Sessions by Model</h2>
          </CardHeader>
          <CardContent>
            {stats?.modelBreakdown && stats.modelBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.modelBreakdown.map((model) => (
                  <div key={model.model} className="flex items-center justify-between">
                    <span className="font-mono text-sm text-grid-text truncate max-w-[180px]">{model.model}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">{model.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-grid-text-muted text-center py-4">No model data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-grid-text">Peak Activity Hours</h2>
        </CardHeader>
        <CardContent>
          {stats?.peakHours && stats.peakHours.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.peakHours.map((hour) => (
                <Badge key={hour} variant="info" size="sm">
                  {hour.toString().padStart(2, '0')}:00
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-grid-text-muted text-center py-4">No peak hour data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
