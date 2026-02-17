'use client';

export function QuickStatsWidget({ projectCount }: { projectCount: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--grid-bg)' }}>
        <span className="text-2xl">📊</span>
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--grid-text)' }}>{projectCount}</div>
          <div className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>Total Projects</div>
        </div>
      </div>
      <div className="p-3 rounded-lg" style={{ background: 'var(--grid-bg)' }}>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          👋 Welcome to <span style={{ color: 'var(--grid-accent)' }}>Grid Dashboard</span>
        </p>
      </div>
    </div>
  );
}
