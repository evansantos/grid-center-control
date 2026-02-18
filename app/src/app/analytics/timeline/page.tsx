'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionTimeline } from '@/components/session-timeline';

interface SessionOption {
  key: string;
  agent: string;
  date: string;
  messageCount: number;
  duration: number;
  status: 'active' | 'completed' | 'terminated';
}

interface TimelineAnalytics {
  overview: {
    totalEvents: number;
    activeSessions: number;
    avgEventRate: number;
    peakConcurrency: number;
  };
  sessions: SessionOption[];
}

export default function TimelinePage() {
  const [analytics, setAnalytics] = useState<TimelineAnalytics | null>(null);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTimelineData = async () => {
    try {
      const [listResponse, analyticsResponse] = await Promise.all([
        fetch('/api/analytics/timeline?list=true'),
        fetch('/api/analytics/timeline/stats'),
      ]);
      
      const listData = await listResponse.json();
      const analyticsData = await analyticsResponse.json();

      const flatSessions: SessionOption[] = (listData.sessions || []).map((s: any) => ({
        key: s.key,
        agent: s.agentId,
        date: s.date,
        messageCount: s.messageCount || 0,
        duration: s.duration || 0,
        status: s.status || 'completed',
      }));

      setSessions(flatSessions);
      setAnalytics(analyticsData);
      
      if (flatSessions.length > 0 && !selected) {
        setSelected(flatSessions[0].key);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineData();
    const interval = setInterval(fetchTimelineData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchTimelineData();
  };

  const selectedSession = sessions.find(s => s.key === selected);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading && !sessions.length) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="Session Timeline"
          description="Loading session timeline data..."
          icon="📊"
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Session Timeline"
        description="Flame graph visualization of session events and activity patterns"
        icon="📊"
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

      {/* Timeline Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="📊"
            label="Total Events"
            value={analytics.overview.totalEvents}
            variant="info"
          />
          <StatCard
            icon="🟢"
            label="Active Sessions"
            value={analytics.overview.activeSessions}
            variant="success"
          />
          <StatCard
            icon="⚡"
            label="Avg Event Rate"
            value={`${analytics.overview.avgEventRate}/s`}
            variant="default"
          />
          <StatCard
            icon="📈"
            label="Peak Concurrency"
            value={analytics.overview.peakConcurrency}
            variant="warning"
          />
        </div>
      )}

      {/* Session Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-grid-text">
                Select Session
              </label>
              {selectedSession && (
                <div className="flex items-center gap-2 text-xs text-grid-text-muted">
                  <span>{selectedSession.messageCount} messages</span>
                  <span>•</span>
                  <span>{formatDuration(selectedSession.duration)}</span>
                  <span>•</span>
                  <span className={
                    selectedSession.status === 'active' ? 'text-green-400' :
                    selectedSession.status === 'completed' ? 'text-blue-400' : 'text-red-400'
                  }>
                    {selectedSession.status}
                  </span>
                </div>
              )}
            </div>
            
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full bg-grid-surface border border-grid-border rounded-md px-3 py-2 text-sm text-grid-text focus:outline-none focus:ring-2 focus:ring-grid-accent focus:border-transparent"
              disabled={loading}
            >
              {loading && sessions.length === 0 && (
                <option>Loading sessions...</option>
              )}
              {sessions.map(s => (
                <option key={s.key} value={s.key}>
                  {s.agent} — {new Date(s.date).toLocaleString()} — {s.key.slice(0, 8)}
                </option>
              ))}
              {sessions.length === 0 && !loading && (
                <option>No sessions available</option>
              )}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      {selected && (
        <Card>
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-grid-text mb-2">
                Session Timeline
              </h3>
              <div className="text-sm text-grid-text-muted">
                Flame graph showing event sequences and timing patterns
              </div>
            </div>
            <SessionTimeline sessionKey={selected} />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selected && sessions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-grid-text mb-2">
              No Sessions Available
            </h3>
            <p className="text-sm text-grid-text-muted mb-4">
              Timeline data will appear here when sessions are recorded.
            </p>
            <Button variant="secondary" onClick={handleRefresh}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}