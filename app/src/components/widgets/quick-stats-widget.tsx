'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function QuickStatsWidget({ projectCount }: { projectCount: number }) {
  const stats = [
    { label: 'Projects', value: projectCount, icon: '📁', colorClass: 'text-grid-info' },
    { label: 'Agents Online', value: 14, icon: '🤖', colorClass: 'text-grid-success' },
    { label: 'Tasks Today', value: 0, icon: '✅', colorClass: 'text-grid-warning' },
  ];

  return (
    <div className="space-y-3">
      {stats.map((s) => (
        <Card key={s.label} className="p-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{s.icon}</span>
            <div className="flex-1">
              <div className={cn("text-2xl font-bold tabular-nums", s.colorClass)}>{s.value}</div>
              <div className="text-[length:var(--font-size-xs)] uppercase tracking-wider text-grid-text-muted">{s.label}</div>
            </div>
          </div>
        </Card>
      ))}
      <Card className="p-3">
        <div className="text-center">
          <p className="text-[length:var(--font-size-xs)] text-grid-text-muted">
            MCP <span className="text-grid-accent">🔴</span> Mission Control
          </p>
        </div>
      </Card>
    </div>
  );
}
