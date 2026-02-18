'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { 
  type Theme, 
  type ThemeConfig, 
  defaultThemeConfig,
  getInitialTheme, 
  applyTheme, 
  setStoredTheme,
  createSystemThemeListener,
  themeUtils
} from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
  respectSystemPreference: boolean;
  setRespectSystemPreference: (respect: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
  isLoading: true,
  respectSystemPreference: false,
  setRespectSystemPreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
  config?: Partial<ThemeConfig>;
  defaultTheme?: Theme;
  respectSystemPreference?: boolean;
}

export function ThemeProvider({ 
  children, 
  config = {},
  defaultTheme,
  respectSystemPreference: initialRespectSystemPreference = true,
}: ThemeProviderProps) {
  const themeConfig = { ...defaultThemeConfig, ...config };
  if (defaultTheme) {
    themeConfig.defaultTheme = defaultTheme;
  }

  const [theme, setThemeState] = useState<Theme>(themeConfig.defaultTheme);
  const [mounted, setMounted] = useState(false);
  const [respectSystemPreference, setRespectSystemPreference] = useState(initialRespectSystemPreference);

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme(themeConfig);
    setThemeState(initialTheme);
    applyTheme(initialTheme, themeConfig);
    setMounted(true);
  }, []);

  // Listen to system preference changes
  useEffect(() => {
    if (!mounted || !respectSystemPreference) return;

    const removeListener = createSystemThemeListener((systemTheme) => {
      // Only update if we don't have a stored preference
      const hasStoredPreference = localStorage.getItem(themeConfig.storageKey);
      if (!hasStoredPreference) {
        setThemeState(systemTheme);
        applyTheme(systemTheme, themeConfig);
      }
    });

    return removeListener;
  }, [mounted, respectSystemPreference, themeConfig]);

  const setTheme = useCallback((newTheme: Theme) => {
    if (!themeUtils.isValidTheme(newTheme)) {
      console.warn(`Invalid theme: ${newTheme}. Expected 'light' or 'dark'.`);
      return;
    }

    setThemeState(newTheme);
    setStoredTheme(newTheme, themeConfig.storageKey);
    applyTheme(newTheme, themeConfig);
  }, [themeConfig]);

  const toggle = useCallback(() => {
    const nextTheme = themeUtils.getOppositeTheme(theme);
    setTheme(nextTheme);
  }, [theme, setTheme]);

  const contextValue: ThemeContextValue = {
    theme,
    toggle,
    setTheme,
    isLoading: !mounted,
    respectSystemPreference,
    setRespectSystemPreference,
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
