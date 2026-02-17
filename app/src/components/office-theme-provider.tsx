'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

export type OfficeTheme = 'corporate' | 'space' | 'cafe';

const themes: OfficeTheme[] = ['corporate', 'space', 'cafe'];

interface OfficeThemeContextValue {
  theme: OfficeTheme;
  setTheme: (theme: OfficeTheme) => void;
  themes: OfficeTheme[];
}

const OfficeThemeContext = createContext<OfficeThemeContextValue>({
  theme: 'corporate',
  setTheme: () => {},
  themes,
});

export const useOfficeTheme = () => useContext(OfficeThemeContext);

export function OfficeThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<OfficeTheme>('corporate');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('grid-office-theme') as OfficeTheme | null;
    const initial = stored && themes.includes(stored) ? stored : 'corporate';
    setThemeState(initial);
    document.documentElement.setAttribute('data-office-theme', initial);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: OfficeTheme) => {
    setThemeState(t);
    localStorage.setItem('grid-office-theme', t);
    document.documentElement.setAttribute('data-office-theme', t);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <OfficeThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </OfficeThemeContext.Provider>
  );
}
