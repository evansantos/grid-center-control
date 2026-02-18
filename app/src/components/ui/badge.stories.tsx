import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Simple pill-shaped labels for status, categories, or tags.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error', 'info', 'outline'],
      description: 'The visual style variant of the badge',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
      description: 'The size of the badge',
    },
    children: {
      control: { type: 'text' },
      description: 'The content of the badge',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Default',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// All sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge size="sm">Small Badge</Badge>
      <Badge size="md">Medium Badge</Badge>
    </div>
  ),
};

// Status Labels Examples
export const StatusLabels: Story = {
  name: 'Status Labels',
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="success" size="sm">Active</Badge>
      <Badge variant="warning" size="sm">Pending</Badge>
      <Badge variant="error" size="sm">Failed</Badge>
      <Badge variant="info" size="sm">Processing</Badge>
      <Badge variant="default" size="sm">Draft</Badge>
      <Badge variant="outline" size="sm">Archived</Badge>
    </div>
  ),
};

// Agent Names Examples
export const AgentNames: Story = {
  name: 'Agent Names',
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="success" size="md">Claude</Badge>
      <Badge variant="info" size="md">GPT-4</Badge>
      <Badge variant="warning" size="md">Gemini</Badge>
      <Badge variant="default" size="md">Assistant</Badge>
    </div>
  ),
};

// Priority Tags Examples
export const PriorityTags: Story = {
  name: 'Priority Tags',
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="error" size="sm">High Priority</Badge>
      <Badge variant="warning" size="sm">Medium Priority</Badge>
      <Badge variant="success" size="sm">Low Priority</Badge>
      <Badge variant="outline" size="sm">No Priority</Badge>
    </div>
  ),
};

// Individual variant stories
export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
};