'use client';

import { useState, useEffect, useCallback } from 'react';
import { AGENT_DISPLAY } from '@/lib/agent-meta';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorEntry {
  agent: string;
  sessionId: string;
  timestamp: string;
  type: 'tool_error' | 'message_error' | 'general_error' | 'exception';
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface ErrorData {
  errors: ErrorEntry[];
  summary: {
    total: number;
    byAgent: Record<string, number>;
    byType: Record<string, number>;
  };
}

const ERROR_TYPE_VARIANTS: Record<string, 'error' | 'warning' | 'info'> = {
  tool_error: 'error',
  message_error: 'warning',
  general_error: 'warning',
  exception: 'error',
};

const SEVERITY_VARIANTS: Record<string, 'error' | 'warning' | 'info'> = {
  high: 'error',
  medium: 'warning',
  low: 'info',
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

function ErrorBadge({ type, severity }: { type: string; severity: string }) {
  const typeVariant = ERROR_TYPE_VARIANTS[type] || 'info';
  const severityVariant = SEVERITY_VARIANTS[severity] || 'info';
  const typeLabel = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <div className="flex gap-2">
      <Badge variant={typeVariant} size="sm" className="uppercase tracking-wide">
        {typeLabel}
      </Badge>
      <Badge variant={severityVariant} size="sm" className="uppercase tracking-wide">
        {severity}
      </Badge>
    </div>
  );
}

function ErrorRow({ error, onClick }: { error: ErrorEntry; onClick: () => void }) {
  const agent = AGENT_DISPLAY[error.agent] || { name: error.agent.toUpperCase(), emoji: '🔵' };
  
  return (
    <Card 
      className="cursor-pointer mb-2 hover:shadow-sm transition-all duration-200" 
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-base">{agent.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-grid-text">{agent.name}</span>
              <span className="text-[10px] text-grid-text-muted font-mono">
                {error.sessionId.slice(-8)}
              </span>
              <span className="text-[10px] text-grid-text-muted">{formatTimeAgo(error.timestamp)}</span>
            </div>
            <ErrorBadge type={error.type} severity={error.severity} />
          </div>
        </div>
        <div className="text-xs text-grid-text-dim leading-relaxed font-mono truncate">
          {error.message}
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorModal({ error, onClose }: { error: ErrorEntry; onClose: () => void }) {
  const agent = AGENT_DISPLAY[error.agent] || { name: error.agent.toUpperCase(), emoji: '🔵' };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <Card className="max-w-4xl max-h-[80vh] overflow-auto font-mono" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{agent.emoji}</span>
            <div>
              <div className="text-lg font-bold text-grid-text mb-1">
                {agent.name} Error Details
              </div>
              <div className="flex gap-2 items-center text-xs text-grid-text-muted">
                <span>Session: {error.sessionId}</span>
                <span>•</span>
                <span>{new Date(error.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <ErrorBadge type={error.type} severity={error.severity} />
          
          <div className="bg-grid-bg border border-grid-border rounded p-4 font-mono text-xs text-grid-text whitespace-pre-wrap break-words max-h-96 overflow-auto">
            {error.message}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorDashboard() {
  const [data, setData] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedError, setSelectedError] = useState<ErrorEntry | null>(null);
  
  // Filters
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('24');

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedAgent) params.set('agent', selectedAgent);
      if (selectedType) params.set('type', selectedType);
      if (timeRange) params.set('hours', timeRange);
      
      const response = await fetch(`/api/errors?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [selectedAgent, selectedType, timeRange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-grid-text-muted font-mono">
        Loading error data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-grid-error font-mono">
        Error: {error || 'No data'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 font-mono bg-grid-bg text-grid-text min-h-screen">
      {/* Header */}
      <Card className="text-center mb-8">
        <CardContent className="p-5">
          <div className="text-2xl font-bold mb-3">
            ⚠️ System Error Dashboard
          </div>
          <div className="text-sm text-grid-text-muted mb-4 leading-relaxed">
            Real-time monitoring and analysis of errors across the Grid Dashboard ecosystem
          </div>
          
          {/* Purpose explanation */}
          <div className="bg-grid-bg rounded-lg p-4 border border-grid-border text-left mb-4">
            <div className="text-xs font-bold text-grid-text mb-2 uppercase tracking-wide">
              What this dashboard shows
            </div>
            <div className="text-xs text-grid-text-muted leading-relaxed">
              This dashboard aggregates error data from agent session logs, tool failures, and system exceptions. 
              It helps identify patterns, track system health, and diagnose issues across all OpenClaw agents and components.
            </div>
          </div>

          {/* Help text */}
          <div className="flex gap-4 justify-center flex-wrap text-[11px] text-grid-text-muted">
            <div className="flex items-center gap-1">
              <span>🔄</span>
              <span>Auto-refreshes every 15 seconds</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📊</span>
              <span>Click any error for detailed view</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔍</span>
              <span>Use filters to narrow results</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="text-center relative overflow-hidden">
          <CardContent className="p-5">
            <div className="text-3xl font-bold text-grid-error mb-2">
              {data.summary.total}
            </div>
            <div className="text-xs text-grid-text font-bold mb-1">
              Total Errors Found
            </div>
            <div className="text-[10px] text-grid-text-muted leading-snug">
              Errors detected in the selected time range across all agents and systems
            </div>
            <div className="absolute top-3 right-3 text-xl opacity-30">⚠️</div>
          </CardContent>
        </Card>
        
        <Card className="text-center relative overflow-hidden">
          <CardContent className="p-5">
            <div className="text-3xl font-bold text-grid-warning mb-2">
              {Object.keys(data.summary.byAgent).length}
            </div>
            <div className="text-xs text-grid-text font-bold mb-1">
              Affected Agents
            </div>
            <div className="text-[10px] text-grid-text-muted leading-snug">
              Number of different AI agents that encountered errors
            </div>
            <div className="absolute top-3 right-3 text-xl opacity-30">🤖</div>
          </CardContent>
        </Card>
        
        <Card className="text-center relative overflow-hidden">
          <CardContent className="p-5">
            <div className="text-3xl font-bold text-grid-info mb-2">
              {Object.keys(data.summary.byType).length}
            </div>
            <div className="text-xs text-grid-text font-bold mb-1">
              Error Categories
            </div>
            <div className="text-[10px] text-grid-text-muted leading-snug">
              Different types of errors: tools, messages, exceptions, etc.
            </div>
            <div className="absolute top-3 right-3 text-xl opacity-30">📊</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3 border-b border-grid-border">
          <div>
            <div className="text-sm font-bold text-grid-text mb-1">
              🔍 Filter & Search
            </div>
            <div className="text-[11px] text-grid-text-muted">
              Narrow down results by agent, error type, or time period
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={fetchData}
            className="flex items-center gap-1"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </Button>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1.5 min-w-36">
              <div className="flex items-center gap-1">
                <label className="text-[10px] text-grid-text-muted uppercase font-bold">
                  Agent Filter
                </label>
                <span className="text-[9px] text-grid-text-muted opacity-70" title="Filter errors by specific AI agent">ℹ️</span>
              </div>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="p-2 bg-grid-bg border border-grid-border rounded text-xs text-grid-text cursor-pointer"
                title="Select a specific agent to view only its errors"
              >
                <option value="">All Agents ({data.summary.total})</option>
                {Object.keys(data.summary.byAgent).map((agent) => (
                  <option key={agent} value={agent}>
                    {AGENT_DISPLAY[agent]?.name || agent.toUpperCase()} ({data.summary.byAgent[agent]} errors)
                  </option>
                ))}
              </select>
              <div className="text-[9px] text-grid-text-muted opacity-80">
                Choose specific agent or leave empty to see all
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 min-w-36">
              <div className="flex items-center gap-1">
                <label className="text-[10px] text-grid-text-muted uppercase font-bold">
                  Error Type
                </label>
                <span className="text-[9px] text-grid-text-muted opacity-70" title="Filter by category of error">ℹ️</span>
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="p-2 bg-grid-bg border border-grid-border rounded text-xs text-grid-text cursor-pointer"
                title="Filter by error category: tool errors, message errors, exceptions, etc."
              >
                <option value="">All Types ({data.summary.total})</option>
                {Object.keys(data.summary.byType).map((type) => {
                  const label = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <option key={type} value={type}>
                      {label} ({data.summary.byType[type]} errors)
                    </option>
                  );
                })}
              </select>
              <div className="text-[9px] text-grid-text-muted opacity-80">
                Tool errors, exceptions, message errors, etc.
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 min-w-36">
              <div className="flex items-center gap-1">
                <label className="text-[10px] text-grid-text-muted uppercase font-bold">
                  Time Period
                </label>
                <span className="text-[9px] text-grid-text-muted opacity-70" title="Limit results to recent time period">ℹ️</span>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="p-2 bg-grid-bg border border-grid-border rounded text-xs text-grid-text cursor-pointer"
                title="Choose how far back to look for errors"
              >
                <option value="1">Last Hour</option>
                <option value="6">Last 6 Hours</option>
                <option value="24">Last 24 Hours</option>
                <option value="168">Last Week</option>
              </select>
              <div className="text-[9px] text-grid-text-muted opacity-80">
                More recent = faster loading
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors List */}
      <div>
        {data.errors.length === 0 ? (
          <Card className="text-center">
            <CardContent className="py-12">
              <div className="text-6xl mb-6">✅</div>
              <div className="text-xl font-bold mb-3 text-grid-text">
                All Clear!
              </div>
              <div className="text-sm mb-4 text-grid-text-muted">
                No errors found in the selected time range and filters.
              </div>
              
              <div className="bg-grid-bg rounded-lg p-4 mt-6 text-left max-w-md mx-auto">
                <div className="text-xs font-bold text-grid-text mb-2">
                  ℹ️ What this means:
                </div>
                <ul className="text-[11px] text-grid-text-muted leading-relaxed space-y-1 list-disc list-inside">
                  <li>All agents are functioning normally</li>
                  <li>No tool failures or exceptions detected</li>
                  <li>System communication is stable</li>
                  <li>Try adjusting filters or time range to see historical data</li>
                </ul>
              </div>
              
              <div className="mt-6 text-[11px] text-grid-text-muted">
                This dashboard monitors {Object.keys(AGENT_DISPLAY).length}+ agents and refreshes every 15 seconds
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 py-4 border-b border-grid-border">
              <div>
                <div className="text-base font-bold text-grid-text mb-1">
                  📋 Error Log ({data.errors.length} entries)
                </div>
                <div className="text-[11px] text-grid-text-muted">
                  Click on any error below for detailed information and stack traces
                </div>
              </div>
              <div className="text-[10px] text-grid-text-muted text-right">
                <div>Showing {Math.min(100, data.errors.length)} of {data.summary.total} total</div>
                <div className="opacity-70">Most recent errors first</div>
              </div>
            </div>
            {data.errors.map((errorItem, index) => (
              <ErrorRow 
                key={`${errorItem.sessionId}-${errorItem.timestamp}-${index}`}
                error={errorItem}
                onClick={() => setSelectedError(errorItem)}
              />
            ))}
          </>
        )}
      </div>

      {/* Error Modal */}
      {selectedError && (
        <ErrorModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
        />
      )}
    </div>
  );
}