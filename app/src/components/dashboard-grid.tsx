'use client';

import { useState, useEffect, type ReactNode } from 'react';

interface WidgetPosition { x: number; y: number; w: number; h: number }
interface WidgetConfig { id: string; title: string; icon: string; position: WidgetPosition }

type PresetName = 'Default' | 'Compact' | 'Wide';

const PRESETS: Record<PresetName, WidgetConfig[]> = {
  Default: [
    { id: 'projects', title: 'Projects', icon: '📁', position: { x: 1, y: 1, w: 8, h: 1 } },
    { id: 'quick-stats', title: 'Status', icon: '📊', position: { x: 9, y: 1, w: 4, h: 1 } },
    { id: 'recent-activity', title: 'Activity Feed', icon: '📡', position: { x: 9, y: 2, w: 4, h: 1 } },
  ],
  Compact: [
    { id: 'projects', title: 'Projects', icon: '📁', position: { x: 1, y: 1, w: 12, h: 1 } },
    { id: 'quick-stats', title: 'Status', icon: '📊', position: { x: 1, y: 2, w: 6, h: 1 } },
    { id: 'recent-activity', title: 'Activity Feed', icon: '📡', position: { x: 7, y: 2, w: 6, h: 1 } },
  ],
  Wide: [
    { id: 'projects', title: 'Projects', icon: '📁', position: { x: 1, y: 1, w: 6, h: 1 } },
    { id: 'quick-stats', title: 'Status', icon: '📊', position: { x: 7, y: 1, w: 3, h: 1 } },
    { id: 'recent-activity', title: 'Activity Feed', icon: '📡', position: { x: 10, y: 1, w: 3, h: 1 } },
  ],
};

const STORAGE_KEY = 'grid-dashboard-layout';

export function DashboardGrid({ children }: { children: Record<string, ReactNode> }) {
  const [preset, setPreset] = useState<PresetName>('Default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in PRESETS) setPreset(saved as PresetName);
    setMounted(true);
  }, []);

  const handlePresetChange = (name: PresetName) => {
    setPreset(name);
    localStorage.setItem(STORAGE_KEY, name);
  };

  const layout = PRESETS[preset];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>
            Mission Control
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--grid-text-dim)' }}>
            MCP <span style={{ color: 'var(--grid-accent)' }}>🔴</span> Operations Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--grid-text-muted, #44445a)' }}>Layout</span>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--grid-border)' }}>
            {(Object.keys(PRESETS) as PresetName[]).map((name) => (
              <button
                key={name}
                onClick={() => handlePresetChange(name)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: preset === name ? 'var(--grid-accent)' : 'var(--grid-surface)',
                  color: preset === name ? '#fff' : 'var(--grid-text-dim)',
                  borderRight: name !== 'Wide' ? '1px solid var(--grid-border)' : 'none',
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="transition-opacity duration-200"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1rem',
          opacity: mounted ? 1 : 0,
        }}
      >
        {layout.map((widget) => (
          <div
            key={widget.id}
            className="grid-card overflow-hidden"
            style={{
              gridColumn: `${widget.position.x} / span ${widget.position.w}`,
              gridRow: `${widget.position.y} / span ${widget.position.h}`,
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
              style={{
                borderBottom: '1px solid var(--grid-border)',
                color: 'var(--grid-text-dim)',
              }}
            >
              <span>{widget.icon}</span>
              <span>{widget.title}</span>
              <div className="flex-1" />
              <span className="cursor-grab select-none opacity-20 hover:opacity-50 transition-opacity">⋮⋮</span>
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
