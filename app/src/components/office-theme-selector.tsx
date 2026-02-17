'use client';

import { useOfficeTheme, OFFICE_THEMES, type OfficeThemeId } from '@/hooks/use-office-theme';

export function OfficeThemeSelector() {
  const { themeId, setTheme } = useOfficeTheme();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <label style={{ fontSize: 13, color: 'var(--grid-text-dim)' }}>Office Theme</label>
      <select
        value={themeId}
        onChange={(e) => setTheme(e.target.value as OfficeThemeId)}
        style={{
          background: 'var(--grid-surface, #1a1a2e)',
          border: '1px solid var(--grid-border, #333)',
          borderRadius: 6,
          padding: '6px 10px',
          color: 'inherit',
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        {Object.values(OFFICE_THEMES).map((t) => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}
