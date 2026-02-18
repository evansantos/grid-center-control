'use client';

import { useTheme } from './theme-provider';
import { themeUtils } from '@/lib/theme';
import { useState, useEffect } from 'react';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'p-1 w-6 h-6',
  md: 'p-1.5 w-8 h-8',
  lg: 'p-2 w-10 h-10',
};

const variantClasses = {
  default: 'hover:bg-grid-surface-hover border border-grid-border',
  ghost: 'hover:bg-grid-surface-hover',
  outline: 'border border-grid-border hover:border-grid-border-bright',
};

export function ThemeToggle({ 
  size = 'md', 
  variant = 'ghost',
  showLabel = false,
  className = '' 
}: ThemeToggleProps) {
  const { theme, toggle, isLoading } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggle();
  };

  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const nextTheme = themeUtils.getOppositeTheme(theme);
  const nextThemeLabel = themeUtils.formatThemeLabel(nextTheme);

  // Don't render until theme is loaded to prevent hydration mismatch
  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded animate-pulse bg-grid-surface`} />
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isAnimating}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        rounded transition-all duration-200 ease-in-out
        hover:scale-105 active:scale-95
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grid-accent
        text-grid-text-dim hover:text-grid-text
        disabled:opacity-50 disabled:cursor-not-allowed
        relative overflow-hidden
        ${isAnimating ? 'animate-spin' : ''}
        ${className}
      `}
      title={`Switch to ${nextThemeLabel.toLowerCase()} theme`}
      aria-label={`Toggle theme to ${nextThemeLabel.toLowerCase()}`}
      data-theme-toggle
    >
      {/* Background glow effect */}
      <div 
        className={`
          absolute inset-0 rounded transition-opacity duration-300
          ${isAnimating ? 'opacity-100' : 'opacity-0'}
          bg-gradient-to-r from-transparent via-grid-accent-dim to-transparent
          animate-pulse
        `}
      />
      
      {/* Icon container with smooth transition */}
      <div className={`
        relative z-10 transition-transform duration-300
        ${isAnimating ? 'rotate-180' : 'rotate-0'}
      `}>
        {theme === 'dark' ? (
          // Sun icon (for switching to light mode)
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-200"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon icon (for switching to dark mode)
          <svg 
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-200"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>

      {/* Optional label */}
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {themeUtils.formatThemeLabel(theme)}
        </span>
      )}

      {/* Ripple effect on click */}
      <div className={`
        absolute inset-0 rounded transition-transform duration-300 pointer-events-none
        ${isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-0'}
        bg-grid-accent-dim
      `} />
    </button>
  );
}

/**
 * Compact theme toggle for use in tight spaces
 */
export function CompactThemeToggle() {
  return <ThemeToggle size="sm" variant="ghost" />;
}

/**
 * Theme toggle with label for settings pages
 */
export function LabeledThemeToggle() {
  return <ThemeToggle size="md" variant="outline" showLabel />;
}
