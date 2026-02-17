'use client';

export function QuickStatsWidget({ projectCount }: { projectCount: number }) {
  const stats = [
    { label: 'Projects', value: projectCount, icon: '📁', color: 'var(--grid-info, #3b82f6)' },
    { label: 'Agents Online', value: 14, icon: '🤖', color: 'var(--grid-success, #22c55e)' },
    { label: 'Tasks Today', value: 0, icon: '✅', color: 'var(--grid-warning, #f59e0b)' },
  ];

  return (
    <div className="space-y-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 p-3 rounded-lg transition-colors"
          style={{ background: 'var(--grid-bg)' }}
        >
          <span className="text-xl">{s.icon}</span>
          <div className="flex-1">
            <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--grid-text-dim)' }}>{s.label}</div>
          </div>
        </div>
      ))}
      <div className="p-3 rounded-lg text-center" style={{ background: 'var(--grid-bg)' }}>
        <p className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>
          MCP <span style={{ color: 'var(--grid-accent)' }}>🔴</span> Mission Control
        </p>
      </div>
    </div>
  );
}
