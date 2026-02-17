'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useIsMobile } from '@/lib/useMediaQuery';

interface WidgetPosition { x: number; y: number; w: number; h: number }
interface WidgetConfig { id: string; title: string; position: WidgetPosition }

type PresetName = 'Default' | 'Compact' | 'Wide';

const PRESETS: Record<PresetName, WidgetConfig[]> = {
  Default: [
    { id: 'projects', title: 'Projects', position: { x: 1, y: 1, w: 8, h: 1 } },
    { id: 'quick-stats', title: 'Quick Stats', position: { x: 9, y: 1, w: 4, h: 1 } },
    { id: 'recent-activity', title: 'Recent Activity', position: { x: 9, y: 2, w: 4, h: 1 } },
    { id: 'recommendations', title: 'Recommendations', position: { x: 1, y: 2, w: 8, h: 1 } },
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
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>
            Mission Control
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--grid-text-muted)' }}>
            MCP 🔴 Operations Dashboard
          </p>
        </div>
        {/* Segmented layout selector — hide on mobile */}
        <div className={`items-center gap-1 ${isMobile ? 'hidden' : 'flex'}`}>
          <span className="text-xs mr-2" style={{ color: 'var(--grid-text-muted)' }}>Layout</span>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--grid-border)' }}
          >
            {(Object.keys(PRESETS) as PresetName[]).map((name) => (
              <button
                key={name}
                onClick={() => handlePresetChange(name)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: preset === name ? 'var(--grid-accent)' : 'var(--grid-surface)',
                  color: preset === name ? '#fff' : 'var(--grid-text-dim)',
                  borderRight: '1px solid var(--grid-border)',
                }}
              >
                {name}
              </button>
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
          <div
            key={widget.id}
            style={{
              gridColumn: `${widget.position.x} / span ${widget.position.w}`,
              gridRow: `${widget.position.y} / span ${widget.position.h}`,
              border: '1px solid var(--grid-border)',
              background: 'var(--grid-surface)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold"
              style={{ borderBottom: '1px solid var(--grid-border)', color: 'var(--grid-text-dim)' }}
            >
              <span className="cursor-grab select-none opacity-40">⋮⋮</span>
              <span>{widget.title}</span>
            </div>
            <div className="p-4">
              {children[widget.id] ?? null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}