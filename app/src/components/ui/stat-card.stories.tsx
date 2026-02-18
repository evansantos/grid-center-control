import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './stat-card';

const meta: Meta<typeof StatCard> = {
  title: 'UI/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Statistical data display card with trend indicators, status variants, and change tracking. Perfect for mission dashboards and monitoring interfaces.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'The descriptive label for the statistic',
    },
    value: {
      control: { type: 'text' },
      description: 'The main value to display (string or number)',
    },
    icon: {
      control: { type: 'text' },
      description: 'Optional emoji icon displayed with the label',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'Visual variant affecting colors and styling',
    },
    trend: {
      control: { type: 'select' },
      options: ['up', 'down', 'neutral'],
      description: 'Manual trend indicator (auto-computed from changeType if not set)',
    },
    change: {
      control: { type: 'text' },
      description: 'Change indicator text (e.g., "+12%" or "-3.2%")',
    },
    changeType: {
      control: { type: 'select' },
      options: ['increase', 'decrease', 'neutral'],
      description: 'Type of change for automatic trend and color styling',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic stat card with just label and value
 */
export const Default: Story = {
  args: {
    label: 'Active Systems',
    value: '24',
  },
};

/**
 * Stat card with icon and description
 */
export const WithIcon: Story = {
  args: {
    label: 'Fuel Level',
    value: '87%',
    icon: '⛽',
  },
};

/**
 * Stat card showing positive change
 */
export const WithPositiveChange: Story = {
  args: {
    label: 'Power Output',
    value: '2.4 MW',
    icon: '⚡',
    change: '+15%',
    changeType: 'increase',
  },
};

/**
 * Stat card showing negative change
 */
export const WithNegativeChange: Story = {
  args: {
    label: 'Signal Strength',
    value: '67 dBm',
    icon: '📡',
    change: '-8%',
    changeType: 'decrease',
  },
};

/**
 * Stat card with neutral change
 */
export const WithNeutralChange: Story = {
  args: {
    label: 'Temperature',
    value: '21°C',
    icon: '🌡️',
    change: 'stable',
    changeType: 'neutral',
  },
};

/**
 * Success variant stat card
 */
export const SuccessVariant: Story = {
  args: {
    label: 'System Health',
    value: '100%',
    icon: '✅',
    variant: 'success',
    change: '+2%',
    changeType: 'increase',
  },
};

/**
 * Warning variant stat card
 */
export const WarningVariant: Story = {
  args: {
    label: 'Fuel Consumption',
    value: '2.1 L/h',
    icon: '⚠️',
    variant: 'warning',
    change: '+18%',
    changeType: 'increase',
  },
};

/**
 * Error variant stat card
 */
export const ErrorVariant: Story = {
  args: {
    label: 'Critical Alerts',
    value: '3',
    icon: '🚨',
    variant: 'error',
    change: '+2 new',
    changeType: 'increase',
  },
};

/**
 * Info variant stat card
 */
export const InfoVariant: Story = {
  args: {
    label: 'Data Processed',
    value: '1.2 TB',
    icon: '💾',
    variant: 'info',
    change: '+456 GB',
    changeType: 'increase',
  },
};

/**
 * All variants showcase
 */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      <StatCard
        label="Default"
        value="42"
        icon="📊"
        change="+5%"
        changeType="increase"
      />
      <StatCard
        label="Success"
        value="99.9%"
        icon="✅"
        variant="success"
        change="stable"
        changeType="neutral"
      />
      <StatCard
        label="Warning"
        value="75%"
        icon="⚠️"
        variant="warning"
        change="+12%"
        changeType="increase"
      />
      <StatCard
        label="Error"
        value="5"
        icon="🚨"
        variant="error"
        change="+2"
        changeType="increase"
      />
      <StatCard
        label="Info"
        value="2.4 GB"
        icon="💽"
        variant="info"
        change="processing"
        changeType="neutral"
      />
      <StatCard
        label="Minimal"
        value="128"
      />
    </div>
  ),
};

/**
 * Mission control dashboard example
 */
export const MissionDashboard: Story = {
  render: () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
      <StatCard
        label="Crew Status"
        value="6/6"
        icon="👨‍🚀"
        variant="success"
        change="all healthy"
        changeType="neutral"
      />
      <StatCard
        label="Oxygen Level"
        value="94%"
        icon="🫁"
        variant="success"
        change="-2% today"
        changeType="decrease"
      />
      <StatCard
        label="Power Grid"
        value="2.1 MW"
        icon="⚡"
        change="+8%"
        changeType="increase"
      />
      <StatCard
        label="Fuel Reserves"
        value="67%"
        icon="⛽"
        variant="warning"
        change="-15% since launch"
        changeType="decrease"
      />
      <StatCard
        label="Communications"
        value="Strong"
        icon="📡"
        variant="success"
        change="98% uptime"
        changeType="neutral"
      />
      <StatCard
        label="Navigation"
        value="Active"
        icon="🧭"
        variant="info"
        change="GPS + INS"
        changeType="neutral"
      />
      <StatCard
        label="Alerts"
        value="2"
        icon="🚨"
        variant="error"
        change="+1 critical"
        changeType="increase"
      />
      <StatCard
        label="Mission Time"
        value="T+47d"
        icon="⏱️"
        change="on schedule"
        changeType="neutral"
      />
    </div>
  ),
};

/**
 * Large numbers and units
 */
export const LargeNumbers: Story = {
  render: () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      <StatCard
        label="Distance Traveled"
        value="2.1M km"
        icon="🛸"
        change="+45,230 km/day"
        changeType="increase"
      />
      <StatCard
        label="Data Transmitted"
        value="847 GB"
        icon="📡"
        variant="info"
        change="+12 GB today"
        changeType="increase"
      />
      <StatCard
        label="Samples Collected"
        value="1,247"
        icon="🧪"
        variant="success"
        change="+23 today"
        changeType="increase"
      />
    </div>
  ),
};

/**
 * System performance metrics
 */
export const SystemMetrics: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
      <StatCard
        label="CPU Usage"
        value="23%"
        icon="🖥️"
        change="-5%"
        changeType="decrease"
      />
      <StatCard
        label="Memory Usage"
        value="4.2 GB"
        icon="💾"
        variant="warning"
        change="+0.8 GB"
        changeType="increase"
      />
      <StatCard
        label="Network I/O"
        value="156 MB/s"
        icon="🌐"
        variant="info"
        change="peak: 200 MB/s"
        changeType="neutral"
      />
      <StatCard
        label="Storage Used"
        value="67%"
        icon="💽"
        variant="warning"
        change="+2% today"
        changeType="increase"
      />
    </div>
  ),
};

/**
 * Custom styling example
 */
export const CustomStyling: Story = {
  render: () => (
    <div className="space-y-4">
      <StatCard
        className="border-2 border-dashed"
        label="Custom Border"
        value="Special"
        icon="✨"
      />
      <StatCard
        className="shadow-lg"
        label="With Shadow"
        value="Enhanced"
        icon="🌟"
        variant="success"
        change="+bonus"
        changeType="increase"
      />
    </div>
  ),
};

/**
 * Interactive playground
 */
export const Playground: Story = {
  args: {
    label: 'System Status',
    value: '98%',
    icon: '⚙️',
    variant: 'default',
    change: '+2%',
    changeType: 'increase',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interact with the controls below to explore all stat card variations and combinations.',
      },
    },
  },
};