'use client';

import { useTheme } from '@/components/theme-provider';
import { ThemeToggle, CompactThemeToggle, LabeledThemeToggle } from '@/components/theme-toggle';
import { themeUtils, themeColors } from '@/lib/theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Demo component to showcase the theme system functionality
 * This component demonstrates:
 * - Theme provider integration
 * - Theme toggle variations
 * - Theme utilities
 * - CSS custom properties
 * - Animation effects
 */
export function ThemeDemo() {
  const { 
    theme, 
    toggle, 
    setTheme, 
    isLoading, 
    respectSystemPreference, 
    setRespectSystemPreference 
  } = useTheme();

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-grid-surface rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-grid-surface rounded w-1/2"></div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-grid-text mb-2">
          Theme System Demo
        </h2>
        <p className="text-sm text-grid-text-dim">
          Current theme: <strong>{themeUtils.formatThemeLabel(theme)}</strong>
        </p>
      </div>

      {/* Theme Toggle Variations */}
      <div>
        <h3 className="text-md font-medium text-grid-text mb-3">Toggle Variations</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle size="sm" variant="outline" />
            <span className="text-xs text-grid-text-muted">Small</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle size="md" variant="default" />
            <span className="text-xs text-grid-text-muted">Medium</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle size="lg" variant="ghost" />
            <span className="text-xs text-grid-text-muted">Large</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <CompactThemeToggle />
            <span className="text-xs text-grid-text-muted">Compact</span>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <LabeledThemeToggle />
            <span className="text-xs text-grid-text-muted">Labeled</span>
          </div>
        </div>
      </div>

      {/* Theme Controls */}
      <div>
        <h3 className="text-md font-medium text-grid-text mb-3">Direct Controls</h3>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
          <Button 
            size="sm" 
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={toggle}
          >
            Toggle
          </Button>
        </div>
      </div>

      {/* System Preference */}
      <div>
        <h3 className="text-md font-medium text-grid-text mb-3">System Integration</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={respectSystemPreference}
            onChange={(e) => setRespectSystemPreference(e.target.checked)}
            className="w-4 h-4 accent-grid-accent"
          />
          <span className="text-sm text-grid-text">
            Respect system preference
          </span>
        </label>
        <p className="text-xs text-grid-text-muted mt-1">
          When enabled, follows your system's dark/light mode setting
        </p>
      </div>

      {/* Color Palette */}
      <div>
        <h3 className="text-md font-medium text-grid-text mb-3">Color Palette</h3>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {Object.entries({
            Background: themeColors.bg,
            Surface: themeColors.surface,
            Border: themeColors.border,
            Accent: themeColors.accent,
            Text: themeColors.text,
            Success: themeColors.success,
            Warning: themeColors.warning,
            Error: themeColors.error,
            Info: themeColors.info,
          }).map(([name, value]) => (
            <div key={name} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-grid-border-subtle"
                style={{ backgroundColor: value }}
              />
              <span className="text-grid-text-muted">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Utilities Demo */}
      <div>
        <h3 className="text-md font-medium text-grid-text mb-3">Theme Utilities</h3>
        <div className="text-sm space-y-2">
          <p>
            <strong>Current:</strong> {theme} | 
            <strong> Opposite:</strong> {themeUtils.getOppositeTheme(theme)} |
            <strong> Formatted:</strong> {themeUtils.formatThemeLabel(theme)}
          </p>
          <p>
            <strong>Valid theme check:</strong> {themeUtils.isValidTheme(theme) ? '✅' : '❌'}
          </p>
        </div>
      </div>
    </Card>
  );
}