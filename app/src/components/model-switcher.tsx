'use client';

import { useState, useEffect, useRef } from 'react';

const PRESET_MODELS = [
  { id: 'claude-sonnet-4-20250514', label: 'Sonnet 4', icon: '◆' },
  { id: 'claude-opus-4-6', label: 'Opus 4', icon: '◆' },
  { id: 'gpt-4o', label: 'GPT-4o', icon: '●' },
  { id: 'gpt-4.1', label: 'GPT-4.1', icon: '●' },
  { id: 'o3', label: 'o3', icon: '●' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5', icon: '◇' },
];

function getShortName(model: string): string {
  const preset = PRESET_MODELS.find(p => p.id === model);
  if (preset) return preset.label;
  // Shorten: take last segment after /
  const parts = model.split('/');
  return parts[parts.length - 1].slice(0, 12);
}

export function ModelSwitcher() {
  const [model, setModel] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/model').then(r => r.json()).then(d => setModel(d.model || '')).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchModel = async (newModel: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: newModel }),
      });
      if (res.ok) setModel(newModel);
    } catch {}
    setLoading(false);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded transition-colors"
        style={{
          color: 'var(--grid-accent)',
          background: open ? 'var(--grid-surface-hover)' : 'var(--grid-surface)',
          border: '1px solid var(--grid-border)',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <span style={{ fontSize: 8 }}>⬡</span>
        {model ? getShortName(model) : '...'}
      </button>
      {open && (
        <div
          className="absolute top-full right-0 mt-1 min-w-[200px] py-1 rounded-lg shadow-xl z-50"
          style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border-bright)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider" style={{ color: 'var(--grid-text-muted)' }}>
            Switch Model
          </div>
          {PRESET_MODELS.map(preset => (
            <button
              key={preset.id}
              onClick={() => switchModel(preset.id)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
              style={{
                color: model === preset.id ? 'var(--grid-accent)' : 'var(--grid-text-dim)',
                background: model === preset.id ? 'var(--grid-surface-hover)' : 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--grid-surface-hover)'; }}
              onMouseLeave={e => { if (model !== preset.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="opacity-50">{preset.icon}</span>
              <span>{preset.label}</span>
              <span className="ml-auto text-[10px] opacity-40">{preset.id.length > 20 ? preset.id.slice(0, 20) + '…' : preset.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
