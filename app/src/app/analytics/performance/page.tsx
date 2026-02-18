'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AgentPerformance {
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
  health: 'healthy' | 'degraded' | 'unhealthy';
}

export default function PerformancePage() {
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/analytics/performance');
      const data = await response.json();
      setAgents(Array.isArray(data) ? data : []);
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

  // Calculate overview metrics from agents array
  const activeAgents = agents.filter(a => {
    const lastActive = new Date(a.lastActive);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastActive > hourAgo;
  }).length;
  
  const totalSessions = agents.reduce((sum, a) => sum + a.sessionsCount, 0);
  const avgDuration = agents.length > 0 
    ? Math.round(agents.reduce((sum, a) => sum + a.avgDurationSec, 0) / agents.length) 
    : 0;
  const avgSuccessRate = agents.length > 0
    ? Math.round((1 - agents.reduce((sum, a) => sum + a.errorRate, 0) / agents.length) * 100)
    : 0;

  if (loading && agents.length === 0) {
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
          value={activeAgents}
          variant="success"
          change={`${agents.length} total`}
          changeType="neutral"
        />
        <StatCard
          icon="📋"
          label="Total Sessions"
          value={totalSessions}
          variant="info"
        />
        <StatCard
          icon="⚡"
          label="Avg Duration (s)"
          value={avgDuration}
          variant={avgDuration > 300 ? 'warning' : 'default'}
        />
        <StatCard
          icon="✅"
          label="Success Rate"
          value={`${avgSuccessRate}%`}
          variant={avgSuccessRate >= 95 ? 'success' : avgSuccessRate >= 80 ? 'warning' : 'error'}
        />
      </div>

      {/* Agent Performance Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-grid-text">Agent Performance Details</h2>
        </CardHeader>
        <CardContent>
          {agents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grid-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Agent</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Health</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Sessions</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Avg Duration</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Errors</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Last Active</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Trend (7d)</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr key={agent.agentId} className="border-b border-grid-border/50 hover:bg-grid-surface/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{agent.emoji}</span>
                          <span className="font-mono font-semibold text-grid-text uppercase">{agent.agentId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            agent.health === 'healthy' ? 'success' :
                            agent.health === 'degraded' ? 'warning' : 'error'
                          }
                          size="sm"
                        >
                          {agent.health}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {agent.sessionsCount}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {agent.avgDurationSec}s
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        <span className={agent.errorCount === 0 ? 'text-green-400' : 'text-red-400'}>
                          {agent.errorCount}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-grid-text-muted">
                        {new Date(agent.lastActive).toLocaleString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-end gap-0.5 h-4">
                          {agent.trend.map((val, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-grid-accent rounded-sm"
                              style={{ height: `${Math.max(2, (val / Math.max(...agent.trend, 1)) * 16)}px` }}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
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
