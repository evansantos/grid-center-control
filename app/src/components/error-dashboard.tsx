'use client';

import { useState, useEffect, useCallback } from 'react';
import { AGENT_DISPLAY } from '@/lib/agent-meta';

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

const ERROR_TYPE_DISPLAY: Record<string, { label: string; color: string }> = {
  tool_error: { label: 'Tool Error', color: 'var(--grid-error)' },
  message_error: { label: 'Message Error', color: 'var(--grid-orange)' },
  general_error: { label: 'General Error', color: 'var(--grid-yellow)' },
  exception: { label: 'Exception', color: 'var(--grid-danger)' },
};

const SEVERITY_COLORS = {
  high: 'var(--grid-danger)',
  medium: 'var(--grid-orange)',
  low: 'var(--grid-yellow)',
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
  const typeInfo = ERROR_TYPE_DISPLAY[type] || { label: type, color: 'var(--grid-text-secondary)' };
  const severityColor = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || 'var(--grid-text-secondary)';
  
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <span style={{
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 4,
        backgroundColor: `${typeInfo.color}20`,
        color: typeInfo.color,
        border: `1px solid ${typeInfo.color}40`,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        {typeInfo.label}
      </span>
      <span style={{
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 4,
        backgroundColor: `${severityColor}20`,
        color: severityColor,
        border: `1px solid ${severityColor}40`,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        {severity}
      </span>
    </div>
  );
}

function ErrorRow({ error, onClick }: { error: ErrorEntry; onClick: () => void }) {
  const agent = AGENT_DISPLAY[error.agent] || { name: error.agent.toUpperCase(), emoji: '🔵' };
  
  return (
    <div
      onClick={onClick}
      style={{
        padding: 12,
        backgroundColor: 'var(--grid-surface)',
        borderRadius: 6,
        border: '1px solid var(--grid-border)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: 8,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--grid-surface-hover)';
        e.currentTarget.style.borderColor = SEVERITY_COLORS[error.severity as keyof typeof SEVERITY_COLORS];
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--grid-surface)';
        e.currentTarget.style.borderColor = 'var(--grid-border)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{agent.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 'bold', color: 'var(--grid-text)' }}>{agent.name}</span>
            <span style={{ fontSize: 10, color: 'var(--grid-text-secondary)', fontFamily: 'monospace' }}>
              {error.sessionId.slice(-8)}
            </span>
            <span style={{ fontSize: 10, color: 'var(--grid-text-secondary)' }}>{formatTimeAgo(error.timestamp)}</span>
          </div>
          <ErrorBadge type={error.type} severity={error.severity} />
        </div>
      </div>
      <div style={{
        fontSize: 12,
        color: 'var(--grid-text-label)',
        lineHeight: 1.4,
        fontFamily: 'monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {error.message}
      </div>
    </div>
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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'var(--grid-surface)',
        border: '1px solid var(--grid-border)',
        borderRadius: 8,
        padding: 24,
        maxWidth: '80%',
        maxHeight: '80%',
        overflow: 'auto',
        fontFamily: 'monospace',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 24 }}>{agent.emoji}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--grid-text)', marginBottom: 4 }}>
              {agent.name} Error Details
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--grid-text-secondary)' }}>
              <span>Session: {error.sessionId}</span>
              <span>•</span>
              <span>{new Date(error.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: '1px solid var(--grid-text-secondary)',
              color: 'var(--grid-text-secondary)',
              padding: '6px 12px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Close
          </button>
        </div>
        
        {/* Badges */}
        <div style={{ marginBottom: 16 }}>
          <ErrorBadge type={error.type} severity={error.severity} />
        </div>
        
        {/* Message */}
        <div style={{
          backgroundColor: 'var(--grid-bg)',
          border: '1px solid var(--grid-border)',
          borderRadius: 4,
          padding: 16,
          fontFamily: 'monospace',
          fontSize: 12,
          color: 'var(--grid-text)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '400px',
          overflow: 'auto',
        }}>
          {error.message}
        </div>
      </div>
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        color: 'var(--grid-text-secondary)',
        fontFamily: 'monospace' 
      }}>
        Loading error data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        color: 'var(--grid-error)',
        fontFamily: 'monospace' 
      }}>
        Error: {error || 'No data'}
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: 16,
      fontFamily: 'monospace',
      backgroundColor: 'var(--grid-bg)',
      color: 'var(--grid-text)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 32,
        padding: 20,
        backgroundColor: 'var(--grid-surface)',
        borderRadius: 12,
        border: '1px solid var(--grid-border)',
      }}>
        <div style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 12 }}>
          ⚠️ System Error Dashboard
        </div>
        <div style={{ fontSize: 14, color: 'var(--grid-text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Real-time monitoring and analysis of errors across the Grid Dashboard ecosystem
        </div>
        
        {/* Purpose explanation */}
        <div style={{
          backgroundColor: 'var(--grid-bg)',
          borderRadius: 8,
          padding: 16,
          border: '1px solid var(--grid-border)',
          textAlign: 'left',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--grid-text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            What this dashboard shows
          </div>
          <div style={{ fontSize: 12, color: 'var(--grid-text-secondary)', lineHeight: 1.4 }}>
            This dashboard aggregates error data from agent session logs, tool failures, and system exceptions. 
            It helps identify patterns, track system health, and diagnose issues across all OpenClaw agents and components.
          </div>
        </div>

        {/* Help text */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 11, color: 'var(--grid-text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🔄</span>
            <span>Auto-refreshes every 15 seconds</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📊</span>
            <span>Click any error for detailed view</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>🔍</span>
            <span>Use filters to narrow results</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        <div style={{
          padding: 20,
          backgroundColor: 'var(--grid-surface)',
          borderRadius: 12,
          border: '1px solid var(--grid-border)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--grid-error)', marginBottom: 8 }}>
            {data.summary.total}
          </div>
          <div style={{ fontSize: 12, color: 'var(--grid-text)', fontWeight: 'bold', marginBottom: 4 }}>
            Total Errors Found
          </div>
          <div style={{ fontSize: 10, color: 'var(--grid-text-secondary)', lineHeight: 1.3 }}>
            Errors detected in the selected time range across all agents and systems
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 20, opacity: 0.3 }}>⚠️</div>
        </div>
        
        <div style={{
          padding: 20,
          backgroundColor: 'var(--grid-surface)',
          borderRadius: 12,
          border: '1px solid var(--grid-border)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--grid-orange)', marginBottom: 8 }}>
            {Object.keys(data.summary.byAgent).length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--grid-text)', fontWeight: 'bold', marginBottom: 4 }}>
            Affected Agents
          </div>
          <div style={{ fontSize: 10, color: 'var(--grid-text-secondary)', lineHeight: 1.3 }}>
            Number of different AI agents that encountered errors
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 20, opacity: 0.3 }}>🤖</div>
        </div>
        
        <div style={{
          padding: 20,
          backgroundColor: 'var(--grid-surface)',
          borderRadius: 12,
          border: '1px solid var(--grid-border)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--grid-yellow)', marginBottom: 8 }}>
            {Object.keys(data.summary.byType).length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--grid-text)', fontWeight: 'bold', marginBottom: 4 }}>
            Error Categories
          </div>
          <div style={{ fontSize: 10, color: 'var(--grid-text-secondary)', lineHeight: 1.3 }}>
            Different types of errors: tools, messages, exceptions, etc.
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 20, opacity: 0.3 }}>📊</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        marginBottom: 24,
        padding: 20,
        backgroundColor: 'var(--grid-surface)',
        borderRadius: 8,
        border: '1px solid var(--grid-border)',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16,
          borderBottom: '1px solid var(--grid-border)',
          paddingBottom: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--grid-text)', marginBottom: 4 }}>
              🔍 Filter & Search
            </div>
            <div style={{ fontSize: 11, color: 'var(--grid-text-secondary)' }}>
              Narrow down results by agent, error type, or time period
            </div>
          </div>
          <button
            onClick={fetchData}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--grid-bg)',
              border: '1px solid var(--grid-border)',
              borderRadius: 4,
              color: 'var(--grid-text-secondary)',
              fontSize: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--grid-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Agent Filter
              </label>
              <span style={{ fontSize: 9, color: 'var(--grid-text-secondary)', opacity: 0.7 }} title="Filter errors by specific AI agent">ℹ️</span>
            </div>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--grid-bg)',
                border: '1px solid var(--grid-border)',
                borderRadius: 4,
                color: 'var(--grid-text)',
                fontSize: 12,
                cursor: 'pointer',
              }}
              title="Select a specific agent to view only its errors"
            >
              <option value="">All Agents ({data.summary.total})</option>
              {Object.keys(data.summary.byAgent).map((agent) => (
                <option key={agent} value={agent}>
                  {AGENT_DISPLAY[agent]?.name || agent.toUpperCase()} ({data.summary.byAgent[agent]} errors)
                </option>
              ))}
            </select>
            <div style={{ fontSize: 9, color: 'var(--grid-text-secondary)', opacity: 0.8 }}>
              Choose specific agent or leave empty to see all
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--grid-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Error Type
              </label>
              <span style={{ fontSize: 9, color: 'var(--grid-text-secondary)', opacity: 0.7 }} title="Filter by category of error">ℹ️</span>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--grid-bg)',
                border: '1px solid var(--grid-border)',
                borderRadius: 4,
                color: 'var(--grid-text)',
                fontSize: 12,
                cursor: 'pointer',
              }}
              title="Filter by error category: tool errors, message errors, exceptions, etc."
            >
              <option value="">All Types ({data.summary.total})</option>
              {Object.keys(data.summary.byType).map((type) => (
                <option key={type} value={type}>
                  {ERROR_TYPE_DISPLAY[type]?.label || type} ({data.summary.byType[type]} errors)
                </option>
              ))}
            </select>
            <div style={{ fontSize: 9, color: 'var(--grid-text-secondary)', opacity: 0.8 }}>
              Tool errors, exceptions, message errors, etc.
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'var(--grid-text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Time Period
              </label>
              <span style={{ fontSize: 9, color: 'var(--grid-text-secondary)', opacity: 0.7 }} title="Limit results to recent time period">ℹ️</span>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--grid-bg)',
                border: '1px solid var(--grid-border)',
                borderRadius: 4,
                color: 'var(--grid-text)',
                fontSize: 12,
                cursor: 'pointer',
              }}
              title="Choose how far back to look for errors"
            >
              <option value="1">Last Hour</option>
              <option value="6">Last 6 Hours</option>
              <option value="24">Last 24 Hours</option>
              <option value="168">Last Week</option>
            </select>
            <div style={{ fontSize: 9, color: 'var(--grid-text-secondary)', opacity: 0.8 }}>
              More recent = faster loading
            </div>
          </div>
        </div>
      </div>

      {/* Errors List */}
      <div>
        {data.errors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 48,
            backgroundColor: 'var(--grid-surface)',
            borderRadius: 12,
            border: '1px solid var(--grid-border)',
            color: 'var(--grid-text-secondary)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: 'var(--grid-text)' }}>
              All Clear!
            </div>
            <div style={{ fontSize: 14, marginBottom: 16, color: 'var(--grid-text-secondary)' }}>
              No errors found in the selected time range and filters.
            </div>
            
            <div style={{
              backgroundColor: 'var(--grid-bg)',
              borderRadius: 8,
              padding: 16,
              marginTop: 24,
              textAlign: 'left',
              maxWidth: 400,
              margin: '24px auto 0',
            }}>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: 'var(--grid-text)', marginBottom: 8 }}>
                ℹ️ What this means:
              </div>
              <ul style={{ fontSize: 11, color: 'var(--grid-text-secondary)', lineHeight: 1.4, margin: 0, paddingLeft: 16 }}>
                <li>All agents are functioning normally</li>
                <li>No tool failures or exceptions detected</li>
                <li>System communication is stable</li>
                <li>Try adjusting filters or time range to see historical data</li>
              </ul>
            </div>
            
            <div style={{ marginTop: 24, fontSize: 11, color: 'var(--grid-text-secondary)' }}>
              This dashboard monitors {Object.keys(AGENT_DISPLAY).length}+ agents and refreshes every 15 seconds
            </div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              padding: '16px 0',
              borderBottom: '1px solid var(--grid-border)',
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--grid-text)', marginBottom: 4 }}>
                  📋 Error Log ({data.errors.length} entries)
                </div>
                <div style={{ fontSize: 11, color: 'var(--grid-text-secondary)' }}>
                  Click on any error below for detailed information and stack traces
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--grid-text-secondary)', textAlign: 'right' }}>
                <div>Showing {Math.min(100, data.errors.length)} of {data.summary.total} total</div>
                <div style={{ opacity: 0.7 }}>Most recent errors first</div>
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