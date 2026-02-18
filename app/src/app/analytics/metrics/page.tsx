'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SystemMetrics {
  performance: {
    uptime: number;
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
  resources: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    networkIO: number;
  };
  agents: {
    totalAgents: number;
    activeAgents: number;
    idleAgents: number;
    errorAgents: number;
  };
  activity: {
    totalSessions: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
  };
}

interface MetricAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface DashboardData {
  metrics: SystemMetrics;
  alerts: MetricAlert[];
  trends: {
    performance: 'up' | 'down' | 'neutral';
    resources: 'up' | 'down' | 'neutral';
    activity: 'up' | 'down' | 'neutral';
  };
}

export default function MetricsDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/analytics/metrics');
      const data = await response.json();
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchDashboardData, 10000); // Refresh every 10s
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/analytics/alerts/${alertId}/acknowledge`, { method: 'POST' });
      setDashboard(prev => prev ? {
        ...prev,
        alerts: prev.alerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      } : null);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)}GB`;
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)}MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)}KB`;
    return `${bytes}B`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (loading && !dashboard) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Metrics Dashboard"
          description="Loading system metrics and performance data..."
          icon="📊"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => (
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

  const unacknowledgedAlerts = dashboard?.alerts.filter(alert => !alert.acknowledged) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Metrics Dashboard"
        description="Real-time system metrics, performance indicators, and health monitoring"
        icon="📊"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </Button>
            <span className="text-xs text-grid-text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        }
      />

      {/* Active Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <Card className="mb-6 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-grid-text">
                🚨 Active Alerts
              </h2>
              <Badge variant="warning">{unacknowledgedAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unacknowledgedAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-3 bg-grid-surface/50 rounded-lg border border-grid-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={
                      alert.type === 'error' ? 'w-2 h-2 bg-red-500 rounded-full' :
                      alert.type === 'warning' ? 'w-2 h-2 bg-yellow-500 rounded-full' :
                      'w-2 h-2 bg-blue-500 rounded-full'
                    } />
                    <div>
                      <div className="font-medium text-grid-text">{alert.metric}</div>
                      <div className="text-sm text-grid-text-muted">{alert.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-grid-text-muted">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Ack
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-grid-text mb-4">System Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="⏱️"
            label="System Uptime"
            value={formatUptime(dashboard?.metrics.performance.uptime ?? 0)}
            variant="success"
            trend={dashboard?.trends.performance === 'up' ? 'up' : dashboard?.trends.performance === 'down' ? 'down' : 'neutral'}
          />
          <StatCard
            icon="⚡"
            label="Response Time"
            value={`${dashboard?.metrics.performance.responseTime ?? 0}ms`}
            variant={dashboard?.metrics.performance.responseTime && dashboard.metrics.performance.responseTime > 500 ? 'warning' : 'success'}
          />
          <StatCard
            icon="📈"
            label="Throughput"
            value={`${dashboard?.metrics.performance.throughput ?? 0}/s`}
            variant="info"
          />
          <StatCard
            icon="⚠️"
            label="Error Rate"
            value={`${dashboard?.metrics.performance.errorRate ?? 0}%`}
            variant={dashboard?.metrics.performance.errorRate && dashboard.metrics.performance.errorRate > 5 ? 'error' : 'success'}
          />
        </div>
      </div>

      {/* Resource Usage */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-grid-text mb-4">Resource Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="🧠"
            label="Memory Usage"
            value={`${dashboard?.metrics.resources.memoryUsage ?? 0}%`}
            variant={dashboard?.metrics.resources.memoryUsage && dashboard.metrics.resources.memoryUsage > 80 ? 'error' : dashboard?.metrics.resources.memoryUsage && dashboard.metrics.resources.memoryUsage > 60 ? 'warning' : 'success'}
          />
          <StatCard
            icon="⚙️"
            label="CPU Usage"
            value={`${dashboard?.metrics.resources.cpuUsage ?? 0}%`}
            variant={dashboard?.metrics.resources.cpuUsage && dashboard.metrics.resources.cpuUsage > 80 ? 'error' : dashboard?.metrics.resources.cpuUsage && dashboard.metrics.resources.cpuUsage > 60 ? 'warning' : 'success'}
          />
          <StatCard
            icon="💾"
            label="Disk Usage"
            value={`${dashboard?.metrics.resources.diskUsage ?? 0}%`}
            variant={dashboard?.metrics.resources.diskUsage && dashboard.metrics.resources.diskUsage > 90 ? 'error' : dashboard?.metrics.resources.diskUsage && dashboard.metrics.resources.diskUsage > 70 ? 'warning' : 'success'}
          />
          <StatCard
            icon="🌐"
            label="Network I/O"
            value={formatBytes(dashboard?.metrics.resources.networkIO ?? 0)}
            variant="info"
          />
        </div>
      </div>

      {/* Agent Status */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-grid-text mb-4">Agent Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="👥"
            label="Total Agents"
            value={dashboard?.metrics.agents.totalAgents ?? 0}
            variant="info"
          />
          <StatCard
            icon="🟢"
            label="Active Agents"
            value={dashboard?.metrics.agents.activeAgents ?? 0}
            variant="success"
          />
          <StatCard
            icon="⏸️"
            label="Idle Agents"
            value={dashboard?.metrics.agents.idleAgents ?? 0}
            variant="warning"
          />
          <StatCard
            icon="🔴"
            label="Error Agents"
            value={dashboard?.metrics.agents.errorAgents ?? 0}
            variant={dashboard?.metrics.agents.errorAgents && dashboard.metrics.agents.errorAgents > 0 ? 'error' : 'success'}
          />
        </div>
      </div>

      {/* Activity Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-grid-text mb-4">Activity Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="📊"
            label="Total Sessions"
            value={formatNumber(dashboard?.metrics.activity.totalSessions ?? 0)}
            variant="info"
            trend={dashboard?.trends.activity === 'up' ? 'up' : dashboard?.trends.activity === 'down' ? 'down' : 'neutral'}
          />
          <StatCard
            icon="💬"
            label="Total Messages"
            value={formatNumber(dashboard?.metrics.activity.totalMessages ?? 0)}
            variant="info"
          />
          <StatCard
            icon="🪙"
            label="Total Tokens"
            value={formatNumber(dashboard?.metrics.activity.totalTokens ?? 0)}
            variant="info"
          />
          <StatCard
            icon="💰"
            label="Total Cost"
            value={`$${dashboard?.metrics.activity.totalCost.toFixed(2) ?? '0.00'}`}
            variant={dashboard?.metrics.activity.totalCost && dashboard.metrics.activity.totalCost > 1000 ? 'warning' : 'success'}
          />
        </div>
      </div>
    </div>
  );
}