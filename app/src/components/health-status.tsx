'use client';

import { useState, useEffect, useCallback } from 'react';

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
    bg: 'bg-green-500',
    text: 'text-green-400',
    border: 'border-green-500',
    glow: 'shadow-green-500/50'
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-400',
    border: 'border-yellow-500',
    glow: 'shadow-yellow-500/50'
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-400',
    border: 'border-red-500',
    glow: 'shadow-red-500/50'
  }
};

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
          <div className="w-6 h-6 border-2 border-zinc-600 border-t-red-500 rounded-full animate-spin" />
          <span className="text-zinc-400">Loading health status...</span>
        </div>
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="p-6 border border-red-800 rounded-lg bg-red-950/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <h3 className="text-red-400 font-medium">Health Check Failed</h3>
        </div>
        <p className="text-zinc-400 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="p-6 text-center text-zinc-500">
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
          <p className="text-sm text-zinc-500 mt-1">
            System Status
          </p>
        </div>
      </div>

      {/* Individual Checks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-200">Health Checks</h3>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="space-y-2">
          {health.checks.map((check, index) => {
            const colors = STATUS_COLORS[check.status];
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${colors.bg} flex-shrink-0`} />
                  <div>
                    <h4 className="font-medium text-zinc-200">{check.name}</h4>
                    <p className="text-sm text-zinc-400">{check.message}</p>
                    {check.details && (
                      <p className="text-xs text-zinc-600 mt-1 font-mono">
                        {check.details}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  {check.latencyMs && (
                    <span className="text-xs text-zinc-500 font-mono">
                      {formatLatency(check.latencyMs)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Check Timestamp */}
      <div className="text-center text-sm text-zinc-600">
        <p>Last checked: {formatTimestamp(health.timestamp)}</p>
        {lastRefresh && (
          <p>Page refreshed: {lastRefresh.toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
}