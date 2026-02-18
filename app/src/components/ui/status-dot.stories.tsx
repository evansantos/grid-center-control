import type { Meta, StoryObj } from '@storybook/react';
import { StatusDot } from './status-dot';

const meta: Meta<typeof StatusDot> = {
  title: 'Design System/StatusDot',
  component: StatusDot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'idle', 'error', 'busy', 'offline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    status: 'active',
  },
};

export const Idle: Story = {
  args: {
    status: 'idle',
  },
};

export const Error: Story = {
  args: {
    status: 'error',
  },
};

export const Busy: Story = {
  args: {
    status: 'busy',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
  },
};

// Size variations
export const Small: Story = {
  args: {
    status: 'active',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    status: 'active',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    status: 'active',
    size: 'lg',
  },
};

// Showcase all statuses
export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="active" />
        <span className="text-xs text-grid-text-secondary">Active</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="idle" />
        <span className="text-xs text-grid-text-secondary">Idle</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="error" />
        <span className="text-xs text-grid-text-secondary">Error</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="busy" />
        <span className="text-xs text-grid-text-secondary">Busy</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="offline" />
        <span className="text-xs text-grid-text-secondary">Offline</span>
      </div>
    </div>
  ),
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="active" size="sm" />
        <span className="text-xs text-grid-text-secondary">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="active" size="md" />
        <span className="text-xs text-grid-text-secondary">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <StatusDot status="active" size="lg" />
        <span className="text-xs text-grid-text-secondary">Large</span>
      </div>
    </div>
  ),
};