'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface SessionData {
  sessionKey: string;
  agentId: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  duration: number;
  status: 'active' | 'completed' | 'terminated';
  channel: string;
}

interface SessionAnalytics {
  overview: {
    totalSessions: number;
    activeSessions: number;
    avgDuration: number;
    totalMessages: number;
  };
  sessions: SessionData[];
  trends: {
    sessions: 'up' | 'down' | 'neutral';
    duration: 'up' | 'down' | 'neutral';
    messages: 'up' | 'down' | 'neutral';
  };
}

export default function SessionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'terminated'>('all');
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
    const interval = setInterval(fetchSessionData, 15000); // Refresh every 15s for live sessions
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchSessionData();
  };

  // Filter sessions based on search and status
  const filteredSessions = analytics?.sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.sessionKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.channel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Session Analytics"
        description="Monitor active sessions, analyze patterns, and track engagement metrics"
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
          value={analytics?.overview.totalSessions ?? 0}
          variant="info"
          change={analytics?.trends.sessions === 'up' ? '+15' : analytics?.trends.sessions === 'down' ? '-3' : '0'}
          changeType={analytics?.trends.sessions === 'up' ? 'increase' : analytics?.trends.sessions === 'down' ? 'decrease' : 'neutral'}
        />
        <StatCard
          icon="🟢"
          label="Active Sessions"
          value={analytics?.overview.activeSessions ?? 0}
          variant="success"
        />
        <StatCard
          icon="⏱️"
          label="Avg Duration"
          value={analytics?.overview.avgDuration ? formatDuration(analytics.overview.avgDuration) : '0s'}
          variant="default"
          change={analytics?.trends.duration === 'up' ? '+12%' : analytics?.trends.duration === 'down' ? '-8%' : '0%'}
          changeType={analytics?.trends.duration === 'up' ? 'increase' : analytics?.trends.duration === 'down' ? 'decrease' : 'neutral'}
        />
        <StatCard
          icon="💬"
          label="Total Messages"
          value={analytics?.overview.totalMessages ?? 0}
          variant="info"
          change={analytics?.trends.messages === 'up' ? '+142' : analytics?.trends.messages === 'down' ? '-27' : '0'}
          changeType={analytics?.trends.messages === 'up' ? 'increase' : analytics?.trends.messages === 'down' ? 'decrease' : 'neutral'}
        />
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by agent, session key, or channel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'completed', 'terminated'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-grid-text">Sessions</h2>
            <Badge variant="outline" size="sm">
              {filteredSessions.length} of {analytics?.sessions.length ?? 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grid-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Session</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Agent</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Channel</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Messages</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Duration</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session.sessionKey} className="border-b border-grid-border/50 hover:bg-grid-surface/50">
                      <td className="py-3 px-2">
                        <code className="text-xs bg-grid-surface px-1 py-0.5 rounded text-grid-text">
                          {session.sessionKey.substring(0, 12)}...
                        </code>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-mono font-semibold text-grid-text">
                          {session.agentId}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" size="sm">
                          {session.channel}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            session.status === 'active' ? 'success' :
                            session.status === 'completed' ? 'info' : 'error'
                          }
                          size="sm"
                        >
                          {session.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {session.messageCount}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {formatDuration(session.duration)}
                      </td>
                      <td className="py-3 px-2 text-sm text-grid-text-muted">
                        {new Date(session.startTime).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-grid-text-muted">
              {searchTerm || statusFilter !== 'all' 
                ? 'No sessions match your filters'
                : 'No session data available'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}