import type { Meta, StoryObj } from '@storybook/react';
import { PageHeader } from './page-header';
import { Button } from './button';
import { Settings, Plus, Upload, RefreshCw } from 'lucide-react';

const meta: Meta<typeof PageHeader> = {
  title: 'UI/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Page header component for consistent page titles, descriptions, and actions across the mission control interface. Provides proper heading hierarchy and accessible structure.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'The main page title, rendered as h1',
    },
    description: {
      control: { type: 'text' },
      description: 'Optional description text shown below the title',
    },
    icon: {
      control: { type: 'text' },
      description: 'Optional emoji icon displayed next to the title',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant affecting title size and spacing',
    },
    actions: {
      control: false,
      description: 'Optional React node for action buttons or controls',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default page header with just a title
 */
export const Default: Story = {
  args: {
    title: 'Mission Control',
  },
};

/**
 * Page header with description text
 */
export const WithDescription: Story = {
  args: {
    title: 'System Status',
    description: 'Monitor all spacecraft systems and subsystems in real-time. Critical alerts and performance metrics displayed with mission-grade reliability.',
  },
};

/**
 * Page header with icon
 */
export const WithIcon: Story = {
  args: {
    title: 'Navigation',
    icon: '🧭',
    description: 'Stellar navigation and trajectory planning interface',
  },
};

/**
 * Page header with action buttons
 */
export const WithActions: Story = {
  args: {
    title: 'Data Logs',
    description: 'Access and manage system logs, telemetry data, and diagnostic reports',
    actions: (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button variant="secondary" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Log
        </Button>
      </div>
    ),
  },
};

/**
 * Size variants comparison
 */
export const SizeVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-4">Small Size</h3>
        <PageHeader
          size="sm"
          title="Module Settings"
          description="Configure module parameters and operating conditions"
          icon="⚙️"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-4">Medium Size (Default)</h3>
        <PageHeader
          size="md"
          title="Mission Overview"
          description="Central command dashboard for mission planning and execution"
          icon="🚀"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium text-grid-text mb-4">Large Size</h3>
        <PageHeader
          size="lg"
          title="Critical Systems"
          description="Primary life support, power, and navigation systems monitoring"
          icon="🔴"
        />
      </div>
    </div>
  ),
};

/**
 * Complex header with multiple action types
 */
export const ComplexActions: Story = {
  args: {
    title: 'Configuration Manager',
    icon: '⚙️',
    description: 'Manage system configurations, user preferences, and operational parameters. Changes require administrative approval.',
    actions: (
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-grid-border" />
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button variant="primary" size="sm">Save Changes</Button>
      </div>
    ),
  },
};

/**
 * Minimal header for secondary pages
 */
export const Minimal: Story = {
  args: {
    title: 'User Profile',
    size: 'sm',
  },
};

/**
 * Long content example
 */
export const LongContent: Story = {
  args: {
    title: 'Advanced Diagnostic and Troubleshooting Interface',
    icon: '🔧',
    description: 'Comprehensive system diagnostics interface providing detailed analysis of spacecraft systems, subsystems, and component health. This interface includes real-time monitoring capabilities, historical trend analysis, predictive maintenance alerts, and guided troubleshooting workflows designed to maintain mission-critical operations.',
    actions: (
      <Button size="sm">
        <Settings className="h-4 w-4 mr-2" />
        Configure
      </Button>
    ),
  },
};

/**
 * Interactive playground for testing all combinations
 */
export const Playground: Story = {
  args: {
    title: 'Mission Dashboard',
    description: 'Central command interface for mission operations',
    icon: '🚀',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Explore different combinations using the controls below. Note that actions prop is not controllable in the playground.',
      },
    },
  },
};