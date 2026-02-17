'use client';

export function RecentActivityWidget() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="text-4xl opacity-30">📡</div>
      <p className="text-sm font-medium" style={{ color: 'var(--grid-text-dim)' }}>
        Awaiting transmissions...
      </p>
      <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--grid-text-muted, #44445a)' }}>
        Activity will appear here
      </p>
    </div>
  );
}
