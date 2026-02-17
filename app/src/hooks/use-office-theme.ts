'use client';

import { useState, useEffect, useCallback } from 'react';

export type OfficeThemeId = 'default' | 'corporate' | 'space' | 'cafe';

export interface OfficeTheme {
  id: OfficeThemeId;
  label: string;
  floorBg: string;
  floorBorder: string;
  floorTile1: string;
  floorTile2: string;
  neonColor: string;
  neonGlow: string;
  glassColor: string;
}

export const OFFICE_THEMES: Record<OfficeThemeId, OfficeTheme> = {
  default: {
    id: 'default',
    label: '🌙 Default (Neon)',
    floorBg: 'repeating-conic-gradient(#12121a 0% 25%, #0e0e14 0% 50%) 0 0 / 28px 28px',
    floorBorder: '#1a1a2e',
    floorTile1: '#12121a',
    floorTile2: '#0e0e14',
    neonColor: '#22d3ee',
    neonGlow: 'rgba(34,211,238,0.3)',
    glassColor: 'rgba(34,211,238,0.08)',
  },
  corporate: {
    id: 'corporate',
    label: '🏢 Corporate',
    floorBg: 'repeating-conic-gradient(#1e293b 0% 25%, #1a1a2e 0% 50%) 0 0 / 28px 28px',
    floorBorder: '#334155',
    floorTile1: '#1e293b',
    floorTile2: '#1a1a2e',
    neonColor: '#3b82f6',
    neonGlow: 'rgba(59,130,246,0.3)',
    glassColor: 'rgba(59,130,246,0.08)',
  },
  space: {
    id: 'space',
    label: '🚀 Space',
    floorBg: 'repeating-conic-gradient(#1a0a2e 0% 25%, #0a0a0f 0% 50%) 0 0 / 28px 28px',
    floorBorder: '#2d1b69',
    floorTile1: '#1a0a2e',
    floorTile2: '#0a0a0f',
    neonColor: '#a855f7',
    neonGlow: 'rgba(168,85,247,0.3)',
    glassColor: 'rgba(168,85,247,0.08)',
  },
  cafe: {
    id: 'cafe',
    label: '☕ Café',
    floorBg: 'repeating-conic-gradient(#3d2b1a 0% 25%, #2a1f14 0% 50%) 0 0 / 28px 28px',
    floorBorder: '#5c4033',
    floorTile1: '#3d2b1a',
    floorTile2: '#2a1f14',
    neonColor: '#f97316',
    neonGlow: 'rgba(249,115,22,0.3)',
    glassColor: 'rgba(249,115,22,0.08)',
  },
};

const STORAGE_KEY = 'grid-office-theme';

export function useOfficeTheme() {
  const [themeId, setThemeId] = useState<OfficeThemeId>('default');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as OfficeThemeId | null;
      if (stored && OFFICE_THEMES[stored]) setThemeId(stored);
    } catch {}
  }, []);

  const setTheme = useCallback((id: OfficeThemeId) => {
    setThemeId(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch {}
  }, []);

  return { themeId, theme: OFFICE_THEMES[themeId], setTheme };
}
