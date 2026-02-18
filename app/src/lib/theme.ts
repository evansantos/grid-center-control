/**
 * Theme utilities and configuration for the Grid Design System
 */

export type Theme = 'dark' | 'light';
export type SystemTheme = Theme | 'system';

export interface ThemeConfig {
  defaultTheme: Theme;
  storageKey: string;
  attribute: string;
  enableTransitions: boolean;
  enableAnimations: boolean;
}

export const defaultThemeConfig: ThemeConfig = {
  defaultTheme: 'dark',
  storageKey: 'grid-theme',
  attribute: 'data-theme',
  enableTransitions: true,
  enableAnimations: true,
};

/**
 * Detects the user's system theme preference
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  
  return window.matchMedia('(prefers-color-scheme: light)').matches 
    ? 'light' 
    : 'dark';
}

/**
 * Gets the stored theme from localStorage
 */
export function getStoredTheme(storageKey: string = defaultThemeConfig.storageKey): Theme | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    return (stored === 'light' || stored === 'dark') ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Stores the theme in localStorage
 */
export function setStoredTheme(theme: Theme, storageKey: string = defaultThemeConfig.storageKey): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Ignore storage errors (privacy mode, etc.)
  }
}

/**
 * Applies the theme to the document element
 */
export function applyTheme(
  theme: Theme, 
  config: Partial<ThemeConfig> = {}
): void {
  const { attribute, enableTransitions } = { ...defaultThemeConfig, ...config };
  
  if (typeof document === 'undefined') return;

  // Disable transitions temporarily to prevent FOUC
  if (enableTransitions) {
    document.documentElement.style.setProperty('--transition-duration', '0ms');
  }

  // Apply theme
  document.documentElement.setAttribute(attribute, theme);

  // Re-enable transitions after a brief delay
  if (enableTransitions) {
    requestAnimationFrame(() => {
      document.documentElement.style.removeProperty('--transition-duration');
    });
  }
}

/**
 * Resolves the actual theme to apply (handles 'system' preference)
 */
export function resolveTheme(theme: SystemTheme): Theme {
  return theme === 'system' ? getSystemTheme() : theme;
}

/**
 * Gets the initial theme on page load
 */
export function getInitialTheme(
  config: Partial<ThemeConfig> = {}
): Theme {
  const { storageKey, defaultTheme } = { ...defaultThemeConfig, ...config };
  
  const stored = getStoredTheme(storageKey);
  if (stored) return stored;
  
  return getSystemTheme() || defaultTheme;
}

/**
 * Creates a media query listener for system theme changes
 */
export function createSystemThemeListener(
  callback: (theme: Theme) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  
  const listener = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'light' : 'dark');
  };
  
  mediaQuery.addEventListener('change', listener);
  
  return () => {
    mediaQuery.removeEventListener('change', listener);
  };
}

/**
 * Theme validation utilities
 */
export const themeUtils = {
  isValidTheme: (value: unknown): value is Theme => {
    return value === 'light' || value === 'dark';
  },
  
  isValidSystemTheme: (value: unknown): value is SystemTheme => {
    return value === 'light' || value === 'dark' || value === 'system';
  },
  
  getOppositeTheme: (theme: Theme): Theme => {
    return theme === 'dark' ? 'light' : 'dark';
  },
  
  formatThemeLabel: (theme: Theme): string => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  },
};

/**
 * CSS custom properties for theme colors
 */
export const themeColors = {
  // Core colors
  bg: 'var(--grid-bg)',
  surface: 'var(--grid-surface)',
  surfaceHover: 'var(--grid-surface-hover)',
  border: 'var(--grid-border)',
  borderBright: 'var(--grid-border-bright)',
  accent: 'var(--grid-accent)',
  accentDim: 'var(--grid-accent-dim)',
  accentGlow: 'var(--grid-accent-glow)',
  text: 'var(--grid-text)',
  textDim: 'var(--grid-text-dim)',
  textMuted: 'var(--grid-text-muted)',
  
  // Status colors
  success: 'var(--grid-success)',
  warning: 'var(--grid-warning)',
  error: 'var(--grid-error)',
  info: 'var(--grid-info)',
  
  // Extended colors
  borderSubtle: 'var(--grid-border-subtle)',
  textFaint: 'var(--grid-text-faint)',
  textLabel: 'var(--grid-text-label)',
  textSecondary: 'var(--grid-text-secondary)',
  yellow: 'var(--grid-yellow)',
  danger: 'var(--grid-danger)',
  purple: 'var(--grid-purple)',
  cyan: 'var(--grid-cyan)',
  orange: 'var(--grid-orange)',
} as const;

/**
 * Office theme utilities
 */
export type OfficeTheme = 'corporate' | 'space' | 'cafe';

export const officeThemes: Record<OfficeTheme, string> = {
  corporate: 'Corporate',
  space: 'Space Station',
  cafe: 'Coffee Shop',
};

export function applyOfficeTheme(theme: OfficeTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-office-theme', theme);
}