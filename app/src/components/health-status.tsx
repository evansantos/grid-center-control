'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusDot } from '@/components/ui/status-dot';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface HealthCheck {
  name: string;
  status: 'green' | 'yellow' | 'red';
  message: string;
  details?: string;
  latencyMs?: number;
}

interface HealthResponse {
  checks: HealthCheck[];
  overall: 'green' | 'yellow' | 'red';
  timestamp: string;
}

const STATUS_COLORS = {
  green: {
    bg: 'bg-grid-success',
    text: 'text-grid-success',
    border: 'border-grid-success',
    glow: 'shadow-grid-success/50'
  },
  yellow: {
    bg: 'bg-grid-warning',
    text: 'text-grid-warning',
    border: 'border-grid-warning',
    glow: 'shadow-grid-warning/50'
  },
  red: {
    bg: 'bg-grid-error',
    text: 'text-grid-error',
    border: 'border-grid-error',
    glow: 'shadow-grid-error/50'
  }
};

// Helper function to map health check status to StatusDot status
const mapStatusToStatusDot = (status: 'green' | 'yellow' | 'red'): 'active' | 'idle' | 'error' => {
  switch (status) {
    case 'green':
      return 'active';
    case 'yellow':
      return 'idle';
    case 'red':
      return 'error';
  }
};

// Metric descriptions for tooltips
const METRIC_DESCRIPTIONS: Record<string, string> = {
  'Gateway': 'OpenClaw gateway daemon status - manages agent communication and routing',
  'Agent Responsiveness': 'How quickly agents respond to tasks (measures session start latency)',
  'System Resources': 'CPU, memory, disk usage of the host machine',
  'API Response': 'Response times of the dashboard API endpoints'
};

// Info icon component
function InfoIcon({ tooltip }: { tooltip: string }) {
  return (
    <div 
      className="inline-flex items-center justify-center w-4 h-4 ml-1 text-grid-text-muted hover:text-grid-text-dim cursor-help transition-colors"
      title={tooltip}
    >
      <svg
        viewBox="0 0 16 16"
        className="w-3 h-3"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
        />
      </svg>
    </div>
  );
}

export function HealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30 * 1000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const handleRefresh = () => {
    setLoading(true);
    fetchHealth();
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatLatency = (latencyMs?: number) => {
    if (!latencyMs) return '';
    return `${latencyMs}ms`;
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <span className="text-grid-text-dim">Loading health status...</span>
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <Card className="border-grid-error/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <StatusDot status="error" />
            <h3 className="text-grid-error font-medium">Health Check Failed</h3>
          </div>
          <p className="text-grid-text-dim mb-4">{error}</p>
          <Button
            onClick={handleRefresh}
            variant="danger"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <div className="p-6 text-center text-grid-text-muted">
        No health data available
      </div>
    );
  }

  const overallColors = STATUS_COLORS[health.overall];

  return (
    <div className="space-y-6">
      {/* Overall Status Circle */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className={`
            w-24 h-24 rounded-full ${overallColors.bg} 
            shadow-lg ${overallColors.glow} shadow-lg
            ${health.overall !== 'green' ? 'animate-pulse' : ''}
            flex items-center justify-center
          `}>
            <span className="text-2xl font-bold text-white">
              {health.overall === 'green' ? '✓' : health.overall === 'yellow' ? '⚠' : '✗'}
            </span>
          </div>
        </div>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${overallColors.text} capitalize`}>
            {health.overall}
          </h2>
          <p className="text-sm text-grid-text-muted mt-1">
            System Status
          </p>
        </div>
      </div>

      {/* Individual Checks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-grid-text">Health Checks</h3>
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        
        <div className="space-y-2">
          {health.checks.map((check, index) => {
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusDot status={mapStatusToStatusDot(check.status)} />
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-grid-text">{check.name}</h4>
                        {METRIC_DESCRIPTIONS[check.name] && (
                          <InfoIcon tooltip={METRIC_DESCRIPTIONS[check.name]} />
                        )}
                      </div>
                      <p className="text-sm text-grid-text-dim">{check.message}</p>
                      {check.details && (
                        <p className="text-xs text-grid-text-muted mt-1 font-mono">
                          {check.details}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {check.latencyMs && (
                      <span className="text-xs text-grid-text-muted font-mono">
                        {formatLatency(check.latencyMs)}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Last Check Timestamp */}
      <div className="text-center text-sm text-grid-text-muted">
        <p>Last checked: {formatTimestamp(health.timestamp)}</p>
        {lastRefresh && (
          <p>Page refreshed: {lastRefresh.toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
}