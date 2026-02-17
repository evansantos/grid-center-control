'use client';

import { useOfficeTheme, type OfficeTheme } from './office-theme-provider';

const themeOptions: { value: OfficeTheme; label: string; colors: { bg: string; accent: string; wall: string } }[] = [
  { value: 'corporate', label: '🏢 Corporate', colors: { bg: '#1e293b', accent: '#3b82f6', wall: '#475569' } },
  { value: 'space', label: '🚀 Space', colors: { bg: '#0f0a1e', accent: '#8b5cf6', wall: '#2d1f5e' } },
  { value: 'cafe', label: '☕ Café', colors: { bg: '#292018', accent: '#d97706', wall: '#4a3728' } },
];

export function OfficeThemeSelector() {
  const { theme, setTheme } = useOfficeTheme();

  return (
    <div className="rounded-lg p-4 border" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--grid-text)' }}>Office Theme</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
              theme === opt.value ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              borderColor: theme === opt.value ? opt.colors.accent : 'var(--grid-border)',
              ringColor: opt.colors.accent,
              background: theme === opt.value ? `${opt.colors.bg}33` : 'transparent',
            }}
          >
            <div className="flex gap-1 shrink-0">
              {[opt.colors.bg, opt.colors.accent, opt.colors.wall].map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--grid-text)' }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
