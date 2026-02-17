'use client';

export function RecentActivityWidget() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <span className="text-3xl opacity-40">🕐</span>
      <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>No recent activity</p>
    </div>
  );
}
