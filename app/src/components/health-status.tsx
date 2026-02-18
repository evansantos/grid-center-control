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
      className="inline-flex items-center justify-center w-4 h-4 ml-1 text-zinc-500 hover:text-zinc-300 cursor-help transition-colors"
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
                    <div className="flex items-center">
                      <h4 className="font-medium text-zinc-200">{check.name}</h4>
                      {METRIC_DESCRIPTIONS[check.name] && (
                        <InfoIcon tooltip={METRIC_DESCRIPTIONS[check.name]} />
                      )}
                    </div>
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