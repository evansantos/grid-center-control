'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PerformanceMetrics {
  overview: {
    activeAgents: number;
    totalTasks: number;
    avgResponseTime: number;
    successRate: number;
  };
  agents: {
    id: string;
    name: string;
    tasks_completed: number;
    avg_response_time: number;
    success_rate: number;
    status: 'active' | 'idle' | 'offline';
    last_active: string;
  }[];
  trends: {
    performance: 'up' | 'down' | 'neutral';
    tasks: 'up' | 'down' | 'neutral';
    responseTime: 'up' | 'down' | 'neutral';
  };
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/analytics/performance');
      const data = await response.json();
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchPerformanceData();
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
          change={metrics?.trends.performance === 'up' ? '+12%' : metrics?.trends.performance === 'down' ? '-5%' : '0%'}
          changeType={metrics?.trends.performance || 'neutral'}
        />
        <StatCard
          icon="📋"
          label="Total Tasks"
          value={metrics?.overview.totalTasks ?? 0}
          variant="info"
          change={metrics?.trends.tasks === 'up' ? '+25' : metrics?.trends.tasks === 'down' ? '-8' : '0'}
          changeType={metrics?.trends.tasks || 'neutral'}
        />
        <StatCard
          icon="⚡"
          label="Avg Response (ms)"
          value={metrics?.overview.avgResponseTime ?? 0}
          variant={metrics?.overview.avgResponseTime && metrics.overview.avgResponseTime > 1000 ? 'warning' : 'default'}
          change={metrics?.trends.responseTime === 'down' ? '-15%' : metrics?.trends.responseTime === 'up' ? '+8%' : '0%'}
          changeType={metrics?.trends.responseTime === 'down' ? 'increase' : metrics?.trends.responseTime === 'up' ? 'decrease' : 'neutral'}
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
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Tasks</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Avg Response</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Success Rate</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.agents.map((agent) => (
                    <tr key={agent.id} className="border-b border-grid-border/50 hover:bg-grid-surface/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-grid-text">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant={
                            agent.status === 'active' ? 'success' :
                            agent.status === 'idle' ? 'warning' : 'error'
                          }
                          size="sm"
                        >
                          {agent.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {agent.tasks_completed}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {agent.avg_response_time}ms
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        <span className={
                          agent.success_rate >= 95 ? 'text-green-400' :
                          agent.success_rate >= 80 ? 'text-yellow-400' : 'text-red-400'
                        }>
                          {agent.success_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-grid-text-muted">
                        {new Date(agent.last_active).toLocaleString()}
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