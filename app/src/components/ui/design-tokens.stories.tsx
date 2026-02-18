import type { Meta, StoryObj } from '@storybook/react';

// This is a special showcase component for design tokens
const DesignTokens = () => <div>Design System Tokens</div>;

const meta: Meta<typeof DesignTokens> = {
  title: 'Design System/Design Tokens',
  component: DesignTokens,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Design tokens for the Grid HQ Design System. These tokens provide consistent colors, spacing, typography, and other design properties across all components.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Color palette showing all design system colors
 */
export const Colors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4">Core Colors</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-bg border border-grid-border rounded"></div>
            <div className="text-xs">
              <div className="font-mono">--grid-bg</div>
              <div className="text-grid-text-muted">Background</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-surface border border-grid-border rounded"></div>
            <div className="text-xs">
              <div className="font-mono">--grid-surface</div>
              <div className="text-grid-text-muted">Surface</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-surface-hover border border-grid-border rounded"></div>
            <div className="text-xs">
              <div className="font-mono">--grid-surface-hover</div>
              <div className="text-grid-text-muted">Surface Hover</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-accent border border-grid-border rounded"></div>
            <div className="text-xs">
              <div className="font-mono text-white">--grid-accent</div>
              <div className="text-grid-text-muted">Accent</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Text Colors</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-surface border border-grid-border rounded flex items-center px-4">
              <span className="text-grid-text">Primary Text</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-text</div>
              <div className="text-grid-text-muted">Primary text color</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-surface border border-grid-border rounded flex items-center px-4">
              <span className="text-grid-text-dim">Secondary Text</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-text-dim</div>
              <div className="text-grid-text-muted">Secondary text</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-surface border border-grid-border rounded flex items-center px-4">
              <span className="text-grid-text-muted">Muted Text</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-text-muted</div>
              <div className="text-grid-text-muted">Muted text</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Status Colors</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-success border border-grid-border rounded flex items-center justify-center">
              <span className="text-white font-medium">Success</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-success</div>
              <div className="text-grid-text-muted">Success states</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-warning border border-grid-border rounded flex items-center justify-center">
              <span className="text-white font-medium">Warning</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-warning</div>
              <div className="text-grid-text-muted">Warning states</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-error border border-grid-border rounded flex items-center justify-center">
              <span className="text-white font-medium">Error</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-error</div>
              <div className="text-grid-text-muted">Error states</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-info border border-grid-border rounded flex items-center justify-center">
              <span className="text-white font-medium">Info</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-info</div>
              <div className="text-grid-text-muted">Info states</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Extended Palette</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-yellow border border-grid-border rounded flex items-center justify-center">
              <span className="text-white text-sm font-medium">Yellow</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-yellow</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-purple border border-grid-border rounded flex items-center justify-center">
              <span className="text-white text-sm font-medium">Purple</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-purple</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-cyan border border-grid-border rounded flex items-center justify-center">
              <span className="text-white text-sm font-medium">Cyan</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-cyan</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-orange border border-grid-border rounded flex items-center justify-center">
              <span className="text-white text-sm font-medium">Orange</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-orange</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-12 bg-grid-danger border border-grid-border rounded flex items-center justify-center">
              <span className="text-white text-sm font-medium">Danger</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-danger</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Border Colors</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-surface border-4 border-grid-border rounded flex items-center justify-center">
              <span className="text-grid-text text-sm">Default Border</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-border</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-surface border-4 border-grid-border-bright rounded flex items-center justify-center">
              <span className="text-grid-text text-sm">Bright Border</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-border-bright</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-surface border-4 border-grid-border-subtle rounded flex items-center justify-center">
              <span className="text-grid-text text-sm">Subtle Border</span>
            </div>
            <div className="text-xs">
              <div className="font-mono">--grid-border-subtle</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Typography scale and font specifications
 */
export const Typography: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4">Font Family</h2>
        <div className="p-4 bg-grid-surface border border-grid-border rounded-lg">
          <div className="font-mono text-grid-text">
            'JetBrains Mono', 'SF Mono', ui-monospace, monospace
          </div>
          <div className="text-xs text-grid-text-muted mt-2">
            Monospace font stack for technical precision and readability
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Font Sizes</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-grid-surface border border-grid-border rounded">
            <span style={{ fontSize: 'var(--font-size-xs)' }}>Extra Small Text (11px)</span>
            <code className="text-xs text-grid-text-muted">--font-size-xs</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-grid-surface border border-grid-border rounded">
            <span style={{ fontSize: 'var(--font-size-sm)' }}>Small Text (12px)</span>
            <code className="text-xs text-grid-text-muted">--font-size-sm</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-grid-surface border border-grid-border rounded">
            <span style={{ fontSize: 'var(--font-size-base)' }}>Base Text (13px)</span>
            <code className="text-xs text-grid-text-muted">--font-size-base</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-grid-surface border border-grid-border rounded">
            <span style={{ fontSize: 'var(--font-size-md)' }}>Medium Text (14px)</span>
            <code className="text-xs text-grid-text-muted">--font-size-md</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-grid-surface border border-grid-border rounded">
            <span style={{ fontSize: 'var(--font-size-lg)' }}>Large Text (16px)</span>
            <code className="text-xs text-grid-text-muted">--font-size-lg</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-grid-surface border border-grid-border rounded">
            <span style={{ fontSize: 'var(--font-size-xl)' }}>Extra Large Text (20px)</span>
            <code className="text-xs text-grid-text-muted">--font-size-xl</code>
          </div>
          <div className="flex items-center justify-between p-3 bg-grid-surface border border-grid-border rounded">
            <span style={{ fontSize: 'var(--font-size-2xl)' }}>2X Large Text (28px)</span>
            <code className="text-xs text-grid-text-muted">--font-size-2xl</code>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Heading Hierarchy</h2>
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">H1 - Main Page Title</h1>
          <h2 className="text-xl font-bold">H2 - Section Header</h2>
          <h3 className="text-lg font-bold">H3 - Subsection</h3>
          <h4 className="text-base font-semibold">H4 - Component Title</h4>
          <h5 className="text-sm font-semibold">H5 - Small Header</h5>
          <h6 className="text-xs font-semibold">H6 - Micro Header</h6>
        </div>
      </div>
    </div>
  ),
};

/**
 * Spacing system and layout tokens
 */
export const Spacing: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4">Border Radius</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-accent" style={{ borderRadius: 'var(--radius-sm)' }}></div>
            <div className="text-xs">
              <div className="font-mono">--radius-sm</div>
              <div className="text-grid-text-muted">0.375rem (6px)</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-accent" style={{ borderRadius: 'var(--radius-md)' }}></div>
            <div className="text-xs">
              <div className="font-mono">--radius-md</div>
              <div className="text-grid-text-muted">0.5rem (8px)</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-accent" style={{ borderRadius: 'var(--radius-lg)' }}></div>
            <div className="text-xs">
              <div className="font-mono">--radius-lg</div>
              <div className="text-grid-text-muted">0.75rem (12px)</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Grid Legacy Radius</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-info" style={{ borderRadius: 'var(--grid-radius)' }}></div>
            <div className="text-xs">
              <div className="font-mono">--grid-radius</div>
              <div className="text-grid-text-muted">0.5rem (8px) - Standard</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-16 bg-grid-info" style={{ borderRadius: 'var(--grid-radius-lg)' }}></div>
            <div className="text-xs">
              <div className="font-mono">--grid-radius-lg</div>
              <div className="text-grid-text-muted">0.75rem (12px) - Large</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Component Spacing</h2>
        <div className="space-y-4">
          <div className="p-4 bg-grid-surface border border-grid-border rounded">
            <div className="text-sm font-medium mb-2">Touch Target Minimum</div>
            <div className="w-11 h-11 bg-grid-accent rounded flex items-center justify-center text-white text-xs">
              44px
            </div>
            <div className="text-xs text-grid-text-muted mt-1">
              Minimum size for interactive elements (WCAG AA)
            </div>
          </div>
          
          <div className="p-4 bg-grid-surface border border-grid-border rounded">
            <div className="text-sm font-medium mb-2">Button Sizes</div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-2.5 bg-grid-accent text-white rounded text-xs min-h-[44px] flex items-center">
                Small (sm)
              </div>
              <div className="px-4 py-3 bg-grid-accent text-white rounded text-sm min-h-[44px] flex items-center">
                Medium (md)
              </div>
              <div className="px-6 py-3.5 bg-grid-accent text-white rounded text-base min-h-[48px] flex items-center">
                Large (lg)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Theme variations showcase
 */
export const ThemeVariations: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold mb-4">Light vs Dark Theme</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-4 rounded-lg border border-grid-border bg-grid-surface">
            <h3 className="font-bold mb-3">Current Theme</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-grid-bg border border-grid-border rounded text-sm">
                <span>Background</span>
                <div className="w-6 h-6 bg-grid-bg border border-grid-border rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-grid-bg border border-grid-border rounded text-sm">
                <span>Surface</span>
                <div className="w-6 h-6 bg-grid-surface border border-grid-border rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-grid-bg border border-grid-border rounded text-sm">
                <span>Text</span>
                <div className="w-6 h-6 bg-grid-text border border-grid-border rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-grid-bg border border-grid-border rounded text-sm">
                <span>Accent</span>
                <div className="w-6 h-6 bg-grid-accent border border-grid-border rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg border border-gray-300 bg-white text-black">
            <h3 className="font-bold mb-3">Light Theme Preview</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <span>Background</span>
                <div className="w-6 h-6 bg-gray-50 border border-gray-300 rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <span>Surface</span>
                <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <span>Text</span>
                <div className="w-6 h-6 bg-gray-900 border border-gray-300 rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <span>Accent</span>
                <div className="w-6 h-6 bg-red-700 border border-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Accent Variations</h2>
        <div className="p-4 bg-grid-surface border border-grid-border rounded-lg">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded" style={{ background: 'var(--grid-accent)' }}></div>
              <div className="text-xs">
                <div className="font-mono">Solid</div>
                <div className="text-grid-text-muted">--grid-accent</div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded" style={{ background: 'var(--grid-accent-dim)' }}></div>
              <div className="text-xs">
                <div className="font-mono">Dim</div>
                <div className="text-grid-text-muted">--grid-accent-dim</div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded" style={{ background: 'var(--grid-accent-glow)', boxShadow: '0 0 12px var(--grid-accent-glow)' }}></div>
              <div className="text-xs">
                <div className="font-mono">Glow</div>
                <div className="text-grid-text-muted">--grid-accent-glow</div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded bg-grid-surface border border-grid-accent"></div>
              <div className="text-xs">
                <div className="font-mono">Border</div>
                <div className="text-grid-text-muted">Used for focus</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Usage guidelines and best practices
 */
export const Usage: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold mb-4">Using Design Tokens</h2>
        <div className="space-y-4">
          <div className="p-4 bg-grid-surface border border-grid-border rounded-lg">
            <h3 className="font-semibold text-sm mb-2">CSS Custom Properties</h3>
            <pre className="text-xs text-grid-text-muted font-mono bg-grid-bg p-2 rounded">
{`/* Use tokens in CSS */
.my-component {
  background: var(--grid-surface);
  color: var(--grid-text);
  border: 1px solid var(--grid-border);
  border-radius: var(--grid-radius);
}`}
            </pre>
          </div>

          <div className="p-4 bg-grid-surface border border-grid-border rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Tailwind Classes</h3>
            <pre className="text-xs text-grid-text-muted font-mono bg-grid-bg p-2 rounded">
{`<!-- Use Tailwind utility classes -->
<div className="bg-grid-surface text-grid-text border-grid-border rounded-md">
  Content with consistent theming
</div>`}
            </pre>
          </div>

          <div className="p-4 bg-grid-surface border border-grid-border rounded-lg">
            <h3 className="font-semibold text-sm mb-2">Component Variants</h3>
            <pre className="text-xs text-grid-text-muted font-mono bg-grid-bg p-2 rounded">
{`// Use CVA for component variants
const variants = cva('base-styles', {
  variants: {
    variant: {
      primary: 'bg-grid-accent text-white',
      secondary: 'bg-grid-surface border-grid-border',
      success: 'bg-grid-success text-white',
    }
  }
})`}
            </pre>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Best Practices</h2>
        <div className="space-y-3">
          <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
            <div className="text-green-400 text-sm font-medium mb-1">✅ Do</div>
            <div className="text-xs text-grid-text-muted">
              Use semantic token names (--grid-success, --grid-error) instead of color names (--grid-red, --grid-green)
            </div>
          </div>
          
          <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
            <div className="text-green-400 text-sm font-medium mb-1">✅ Do</div>
            <div className="text-xs text-grid-text-muted">
              Ensure minimum 44px touch targets for interactive elements
            </div>
          </div>
          
          <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
            <div className="text-green-400 text-sm font-medium mb-1">✅ Do</div>
            <div className="text-xs text-grid-text-muted">
              Test components in both light and dark themes
            </div>
          </div>

          <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <div className="text-red-400 text-sm font-medium mb-1">❌ Don't</div>
            <div className="text-xs text-grid-text-muted">
              Hardcode color values or spacing - always use tokens
            </div>
          </div>
          
          <div className="p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
            <div className="text-red-400 text-sm font-medium mb-1">❌ Don't</div>
            <div className="text-xs text-grid-text-muted">
              Create new tokens without discussing with the design system team
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};