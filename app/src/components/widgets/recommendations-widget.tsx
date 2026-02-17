'use client';

import { useState, useEffect } from 'react';

interface Recommendation {
  type: 'stale_pending' | 'long_running' | 'needs_review' | 'ready_to_close';
  severity: 'warning' | 'info' | 'urgent';
  message: string;
  count: number;
  projectName: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

const TYPE_LABELS: Record<string, string> = {
  stale_pending: 'Stale',
  long_running: 'Long Running',
  needs_review: 'Needs Review',
  ready_to_close: 'Ready to Close',
};

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const res = await fetch('/api/recommendations');
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) setRecommendations(data.recommendations ?? []);
      } catch {
        if (active) setRecommendations([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  if (loading) {
    return (
      <div className="font-mono text-xs" style={{ color: 'var(--grid-text-muted)' }}>
        Loading recommendations…
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="font-mono text-sm text-center py-2" style={{ color: '#22c55e' }}>
        All clear — fleet running smooth ✅
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-2 py-1 rounded"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <span
            className="shrink-0 w-2 h-2 rounded-full"
            style={{ background: SEVERITY_COLORS[rec.severity] ?? '#6b7280' }}
          />
          <span className="font-mono text-xs flex-1 truncate" style={{ color: 'var(--grid-text)' }}>
            {rec.message}
          </span>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
            style={{
              background: 'var(--grid-border)',
              color: 'var(--grid-text-muted)',
            }}
          >
            {TYPE_LABELS[rec.type] ?? rec.type}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RecommendationsWidget;
