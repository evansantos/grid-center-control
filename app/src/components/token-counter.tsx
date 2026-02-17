'use client';

import { useState, useEffect, useCallback } from 'react';
import { AGENT_DISPLAY } from '@/lib/agent-meta';

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  sessionCount: number;
}

interface TokenData {
  agents: Record<string, TokenUsage>;
  daily: Record<string, number>;
  total: { input: number; output: number; total: number };
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

function getGaugeColor(tokens: number): string {
  if (tokens < 100_000) return '#22c55e'; // green
  if (tokens < 500_000) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function TokenGauge({ tokens, maxTokens = 1_000_000 }: { tokens: number; maxTokens?: number }) {
  const percentage = Math.min((tokens / maxTokens) * 100, 100);
  const color = getGaugeColor(tokens);
  
  return (
    <div style={{
      width: '100%',
      height: 8,
      backgroundColor: '#1e293b',
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: 8,
    }}>
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 4,
          transition: 'width 0.3s ease, background-color 0.3s ease',
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}

function DailyChart({ dailyData }: { dailyData: Record<string, number> }) {
  const entries = Object.entries(dailyData).sort(([a], [b]) => a.localeCompare(b));
  const maxTokens = Math.max(...entries.map(([, tokens]) => tokens), 1);
  
  if (entries.length === 0) {
    return (
      <div style={{ 
        padding: 16, 
        textAlign: 'center', 
        color: '#64748b',
        fontFamily: 'monospace',
        fontSize: 12 
      }}>
        No daily data available
      </div>
    );
  }
  
  return (
    <div style={{ padding: 16 }}>
      <div style={{ 
        fontFamily: 'monospace', 
        fontSize: 12, 
        fontWeight: 'bold',
        color: '#e2e8f0',
        marginBottom: 12 
      }}>
        Daily Token Usage
      </div>
      <div style={{ display: 'flex', alignItems: 'end', gap: 4, height: 60 }}>
        {entries.map(([date, tokens]) => {
          const height = (tokens / maxTokens) * 50;
          const color = getGaugeColor(tokens);
          
          return (
            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div
                style={{
                  width: '100%',
                  height: height + 10, // min height
                  backgroundColor: color,
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.8,
                  transition: 'height 0.3s ease',
                  boxShadow: `0 0 4px ${color}40`,
                }}
                title={`${date}: ${formatNumber(tokens)} tokens`}
              />
              <div style={{ 
                fontSize: 8, 
                color: '#64748b',
                fontFamily: 'monospace',
                marginTop: 4,
                textAlign: 'center' 
              }}>
                {date.split('-').slice(1).join('/')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TokenCounter() {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/tokens');
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
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200,
        color: '#64748b',
        fontFamily: 'monospace' 
      }}>
        Loading token usage...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200,
        color: '#ef4444',
        fontFamily: 'monospace' 
      }}>
        Error: {error || 'No data'}
      </div>
    );
  }

  const agentEntries = Object.entries(data.agents)
    .filter(([, usage]) => usage.totalTokens > 0)
    .sort(([, a], [, b]) => b.totalTokens - a.totalTokens);

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: 16,
      fontFamily: 'monospace',
      backgroundColor: '#0f172a',
      color: '#e2e8f0',
      minHeight: '100vh'
    }}>
      {/* Hero Total */}
      <div style={{
        textAlign: 'center',
        marginBottom: 32,
        padding: 24,
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: 12,
        border: '1px solid #334155',
      }}>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
          💰 Total Today
        </div>
        <div style={{ 
          fontSize: 36, 
          fontWeight: 'bold',
          color: '#22c55e',
          marginBottom: 8,
          textShadow: '0 0 10px #22c55e40'
        }}>
          {formatNumber(data.total.total)}
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          {formatNumber(data.total.input)} input • {formatNumber(data.total.output)} output
        </div>
      </div>

      {/* Agent Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {agentEntries.map(([agentId, usage]) => {
          const agent = AGENT_DISPLAY[agentId] || { name: agentId.toUpperCase(), emoji: '🔵' };
          
          return (
            <div
              key={agentId}
              style={{
                padding: 16,
                backgroundColor: '#1e293b',
                borderRadius: 8,
                border: '1px solid #334155',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Agent Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{agent.emoji}</span>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>
                    {usage.sessionCount} sessions
                  </div>
                </div>
              </div>

              {/* Token Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Input</div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#3b82f6' }}>
                    {formatNumber(usage.inputTokens)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Output</div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#f59e0b' }}>
                    {formatNumber(usage.outputTokens)}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Total</div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: getGaugeColor(usage.totalTokens) }}>
                    {formatNumber(usage.totalTokens)}
                  </div>
                </div>
              </div>

              {/* Gauge */}
              <TokenGauge tokens={usage.totalTokens} />
            </div>
          );
        })}
      </div>

      {/* Daily Chart */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: 8,
        border: '1px solid #334155',
      }}>
        <DailyChart dailyData={data.daily} />
      </div>
    </div>
  );
}