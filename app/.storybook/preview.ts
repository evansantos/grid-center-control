import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0a0a0f',
        },
        {
          name: 'light',
          value: '#f5f5f7',
        },
      ],
    },

    docs: {
      theme: {
        colorPrimary: '#ff4444',
        colorSecondary: '#ff4444',
        
        // UI
        appBg: '#0a0a0f',
        appContentBg: '#12121a',
        appBorderColor: '#1e1e2e',
        appBorderRadius: 8,
        
        // Text colors
        textColor: '#e0e0e0',
        textInverseColor: '#0a0a0f',
        textMutedColor: '#888',
        
        // Toolbar default and active colors
        barTextColor: '#e0e0e0',
        barSelectedColor: '#ff4444',
        barBg: '#12121a',
        
        // Form colors
        inputBg: '#12121a',
        inputBorder: '#1e1e2e',
        inputTextColor: '#e0e0e0',
        inputBorderRadius: 8,

        brandTitle: 'Grid HQ Design System',
        brandUrl: '/',
        brandTarget: '_self',
        fontBase: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
        fontCode: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
      }
    }
  },

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark', left: '🌙' },
          { value: 'light', title: 'Light', left: '☀️' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;