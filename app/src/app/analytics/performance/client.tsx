'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface PerformanceMetrics {
  overview: {
    activeAgents: number;
    totalSessions: number;
    avgDuration: number;
    successRate: number;
  };
  agents: AgentScorecard[];
}

function transformApiData(data: AgentScorecard[]): PerformanceMetrics {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  const activeAgents = data.filter(a => 
    a.lastActive && new Date(a.lastActive).getTime() > fiveMinutesAgo
  ).length;
  
  const totalSessions = data.reduce((sum, a) => sum + a.sessionsCount, 0);
  const totalDuration = data.reduce((sum, a) => sum + (a.avgDurationSec * a.sessionsCount), 0);
  const avgDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
  
  const totalErrors = data.reduce((sum, a) => sum + a.errorCount, 0);
  const successRate = totalSessions > 0 
    ? Math.round(((totalSessions - totalErrors) / totalSessions) * 100) 
    : 100;

  return {
    overview: {
      activeAgents,
      totalSessions,
      avgDuration,
      successRate,
    },
    agents: data,
  };
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/analytics/performance');
      const data: AgentScorecard[] = await response.json();
      const transformed = transformApiData(Array.isArray(data) ? data : []);
      setMetrics(transformed);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchPerformanceData();
  };

  const getAgentStatus = (agent: AgentScorecard): 'active' | 'idle' | 'offline' => {
    if (!agent.lastActive) return 'offline';
    const lastActive = new Date(agent.lastActive).getTime();
    const now = Date.now();
    if (now - lastActive < 5 * 60 * 1000) return 'active';
    if (now - lastActive < 60 * 60 * 1000) return 'idle';
    return 'offline';
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading && !metrics) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="Performance Analytics"
          description="Loading agent performance metrics..."
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
        title="Performance Analytics"
        description="Real-time agent performance metrics and health indicators"
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

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="🟢"
          label="Active Agents"
          value={metrics?.overview.activeAgents ?? 0}
          variant="success"
        />
        <StatCard
          icon="📋"
          label="Total Sessions"
          value={metrics?.overview.totalSessions ?? 0}
          variant="info"
        />
        <StatCard
          icon="⚡"
          label="Avg Duration"
          value={formatDuration(metrics?.overview.avgDuration ?? 0)}
          variant="default"
        />
        <StatCard
          icon="✅"
          label="Success Rate"
          value={`${metrics?.overview.successRate ?? 0}%`}
          variant={metrics?.overview.successRate && metrics.overview.successRate >= 95 ? 'success' : 'warning'}
        />
      </div>

      {/* Agent Performance Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-grid-text">Agent Performance Details</h2>
        </CardHeader>
        <CardContent>
          {metrics?.agents && metrics.agents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grid-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Agent</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Sessions</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Avg Duration</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Health</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.agents.map((agent) => {
                    const status = getAgentStatus(agent);
                    return (
                      <tr key={agent.agentId} className="border-b border-grid-border/50 hover:bg-grid-surface/50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span>{agent.emoji}</span>
                            <span className="font-mono font-semibold text-grid-text">{agent.agentId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={
                              status === 'active' ? 'success' :
                              status === 'idle' ? 'warning' : 'error'
                            }
                            size="sm"
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-grid-text">
                          {agent.sessionsCount}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-grid-text">
                          {formatDuration(agent.avgDurationSec)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Badge
                            variant={
                              agent.health === 'healthy' ? 'success' :
                              agent.health === 'watch' ? 'warning' : 'error'
                            }
                            size="sm"
                          >
                            {agent.health}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm text-grid-text-muted">
                          {agent.lastActive ? new Date(agent.lastActive).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-grid-text-muted">
              No agent performance data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
