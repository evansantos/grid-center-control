'use client';

import { useState, useEffect, useCallback } from 'react';

interface RateLimitBarsProps {
  requestsPerMinuteLimit?: number;
  tokensPerMinuteLimit?: number;
  tokensPerDayLimit?: number;
}

interface RateLimitData {
  requestsPerMinute: number;
  tokensPerMinute: number;
  tokensPerDay: number;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function getBarColor(percentage: number): string {
  if (percentage < 60) return 'var(--grid-success, #22c55e)';
  if (percentage < 85) return 'var(--grid-warning, #eab308)';
  return 'var(--grid-danger, #ef4444)';
}

function ProgressBar({ label, current, max }: { label: string; current: number; max: number }) {
  const percentage = Math.min((current / max) * 100, 100);
  const color = getBarColor(percentage);
  const isNearLimit = percentage >= 85;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 6,
        fontFamily: 'monospace',
      }}>
        <span style={{ fontSize: 12, color: 'var(--grid-text-dim, #94a3b8)' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--grid-text-muted, #64748b)' }}>
          {formatNumber(current)} / {formatNumber(max)}
          <span style={{ marginLeft: 6, color, fontWeight: 'bold' }}>
            {percentage.toFixed(0)}%
          </span>
        </span>
      </div>
      <div style={{
        width: '100%',
        height: 10,
        backgroundColor: 'var(--grid-surface, #1e293b)',
        borderRadius: 5,
        overflow: 'hidden',
        border: '1px solid var(--grid-border-subtle, #1e293b)',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: 5,
          transition: 'width 0.5s ease, background-color 0.3s ease',
          boxShadow: isNearLimit ? `0 0 12px ${color}, 0 0 4px ${color}` : `0 0 6px ${color}40`,
        }} />
      </div>
    </div>
  );
}

export function RateLimitBars({
  requestsPerMinuteLimit = 60,
  tokensPerMinuteLimit = 80_000,
  tokensPerDayLimit = 1_000_000,
}: RateLimitBarsProps) {
  const [data, setData] = useState<RateLimitData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens');
      if (!res.ok) return;
      const json = await res.json();
      if (json.rateLimits) setData(json.rateLimits);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (!data) {
    return (
      <div style={{
        padding: 20,
        backgroundColor: 'var(--grid-surface, #1e293b)',
        borderRadius: 'var(--grid-radius-lg, 12px)',
        border: '1px solid var(--grid-border, #334155)',
        fontFamily: 'monospace',
        fontSize: 12,
        color: 'var(--grid-text-dim, #94a3b8)',
      }}>
        Loading rate limits…
      </div>
    );
  }

  return (
    <div style={{
      padding: 20,
      backgroundColor: 'var(--grid-surface, #1e293b)',
      borderRadius: 'var(--grid-radius-lg, 12px)',
      border: '1px solid var(--grid-border, #334155)',
    }}>
      <div style={{
        fontFamily: 'monospace',
        fontSize: 13,
        fontWeight: 'bold',
        color: 'var(--grid-text, #e2e8f0)',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span>⚡</span>
        <span>Rate Limits</span>
      </div>
      <ProgressBar label="Requests / min" current={data.requestsPerMinute} max={requestsPerMinuteLimit} />
      <ProgressBar label="Tokens / min" current={data.tokensPerMinute} max={tokensPerMinuteLimit} />
      <ProgressBar label="Tokens / day" current={data.tokensPerDay} max={tokensPerDayLimit} />
    </div>
  );
}
