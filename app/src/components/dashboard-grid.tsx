'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useIsMobile } from '@/lib/useMediaQuery';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WidgetPosition { x: number; y: number; w: number; h: number }
interface WidgetConfig { id: string; title: string; position: WidgetPosition }

type PresetName = 'Default' | 'Compact' | 'Wide';

const PRESETS: Record<PresetName, WidgetConfig[]> = {
  Default: [
    { id: 'projects', title: 'Projects', position: { x: 1, y: 1, w: 8, h: 1 } },
    { id: 'quick-stats', title: 'Quick Stats', position: { x: 9, y: 1, w: 4, h: 1 } },
    { id: 'recommendations', title: 'Recommendations', position: { x: 1, y: 2, w: 8, h: 1 } },
    { id: 'recent-activity', title: 'Recent Activity', position: { x: 9, y: 2, w: 4, h: 1 } },
    { id: 'task-distribution', title: 'Task Distribution', position: { x: 1, y: 3, w: 12, h: 1 } },
  ],
  Compact: [
    { id: 'projects', title: 'Projects', position: { x: 1, y: 1, w: 12, h: 1 } },
    { id: 'quick-stats', title: 'Quick Stats', position: { x: 1, y: 2, w: 6, h: 1 } },
    { id: 'recent-activity', title: 'Recent Activity', position: { x: 7, y: 2, w: 6, h: 1 } },
    { id: 'recommendations', title: 'Recommendations', position: { x: 1, y: 3, w: 12, h: 1 } },
    { id: 'task-distribution', title: 'Task Distribution', position: { x: 1, y: 4, w: 12, h: 1 } },
  ],
  Wide: [
    { id: 'projects', title: 'Projects', position: { x: 1, y: 1, w: 6, h: 1 } },
    { id: 'quick-stats', title: 'Quick Stats', position: { x: 7, y: 1, w: 3, h: 1 } },
    { id: 'recent-activity', title: 'Recent Activity', position: { x: 10, y: 1, w: 3, h: 1 } },
    { id: 'recommendations', title: 'Recommendations', position: { x: 1, y: 2, w: 12, h: 1 } },
    { id: 'task-distribution', title: 'Task Distribution', position: { x: 1, y: 3, w: 12, h: 1 } },
  ],
};

// Mobile layout: stack all widgets vertically
const MOBILE_LAYOUT: WidgetConfig[] = [
  { id: 'projects', title: 'Projects', position: { x: 1, y: 1, w: 12, h: 1 } },
  { id: 'quick-stats', title: 'Quick Stats', position: { x: 1, y: 2, w: 12, h: 1 } },
  { id: 'recommendations', title: 'Recommendations', position: { x: 1, y: 3, w: 12, h: 1 } },
  { id: 'recent-activity', title: 'Recent Activity', position: { x: 1, y: 4, w: 12, h: 1 } },
  { id: 'task-distribution', title: 'Task Distribution', position: { x: 1, y: 5, w: 12, h: 1 } },
];

const STORAGE_KEY = 'grid-dashboard-layout';

export function DashboardGrid({ children }: { children: Record<string, ReactNode> }) {
  const [preset, setPreset] = useState<PresetName>('Default');
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in PRESETS) setPreset(saved as PresetName);
    setMounted(true);
  }, []);

  const handlePresetChange = (name: PresetName) => {
    setPreset(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  // Use mobile layout on mobile, otherwise use selected preset
  const layout = isMobile ? MOBILE_LAYOUT : PRESETS[preset];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wide text-grid-text">
            Mission Control
          </h1>
          <p className="text-[length:var(--font-size-xs)] mt-1 text-grid-text-muted">
            MCP 🔴 Operations Dashboard
          </p>
        </div>
        {/* Segmented layout selector — hide on mobile */}
        <div className={`items-center gap-1 ${isMobile ? 'hidden' : 'flex'}`}>
          <span className="text-[length:var(--font-size-xs)] mr-2 text-grid-text-muted">Layout</span>
          <div className="flex gap-1">
            {(Object.keys(PRESETS) as PresetName[]).map((name) => (
              <Button
                key={name}
                onClick={() => handlePresetChange(name)}
                variant={preset === name ? 'primary' : 'ghost'}
                size="sm"
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1rem',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      >
        {layout.map((widget) => (
          <Card
            key={widget.id}
            className="overflow-hidden"
            style={{
              gridColumn: `${widget.position.x} / span ${widget.position.w}`,
              gridRow: `${widget.position.y} / span ${widget.position.h}`,
            }}
          >
            <CardHeader className="py-2 border-b border-grid-border">
              <div className="flex items-center gap-2 text-[length:var(--font-size-sm)] font-semibold text-grid-text-muted">
                <span className="cursor-grab select-none opacity-40">⋮⋮</span>
                <span>{widget.title}</span>
              </div>
            </CardHeader>
            <CardContent>
              {children[widget.id] ?? null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}