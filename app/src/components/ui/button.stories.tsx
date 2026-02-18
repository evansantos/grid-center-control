import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Play, Loader2, Download, Trash2, Plus } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Mission control interface button component with precise, confident styling. Built for spacecraft-grade reliability.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Primary: Story = {
  args: {
    children: 'Execute Command',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Monitor Status',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'System Check',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Emergency Stop',
  },
};

// Sizes showcase
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// All variants x all sizes matrix
export const VariantSizeMatrix: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">Primary Variant</h3>
        <div className="flex items-center gap-4">
          <Button variant="primary" size="sm">Launch</Button>
          <Button variant="primary" size="md">Launch</Button>
          <Button variant="primary" size="lg">Launch</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">Secondary Variant</h3>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm">Monitor</Button>
          <Button variant="secondary" size="md">Monitor</Button>
          <Button variant="secondary" size="lg">Monitor</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">Ghost Variant</h3>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">Check</Button>
          <Button variant="ghost" size="md">Check</Button>
          <Button variant="ghost" size="lg">Check</Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">Danger Variant</h3>
        <div className="flex items-center gap-4">
          <Button variant="danger" size="sm">Abort</Button>
          <Button variant="danger" size="md">Abort</Button>
          <Button variant="danger" size="lg">Abort</Button>
        </div>
      </div>
    </div>
  ),
};

// Disabled states
export const DisabledStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">Disabled States</h3>
        <div className="flex items-center gap-4">
          <Button disabled>Primary Disabled</Button>
          <Button variant="secondary" disabled>Secondary Disabled</Button>
          <Button variant="ghost" disabled>Ghost Disabled</Button>
          <Button variant="danger" disabled>Danger Disabled</Button>
        </div>
      </div>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">With Icons</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Start Mission
          </Button>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download Data
          </Button>
          <Button variant="ghost">
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
          <Button variant="danger">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Config
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">Icon Only</h3>
        <div className="flex items-center gap-4">
          <Button size="sm">
            <Play className="h-3 w-3" />
          </Button>
          <Button size="md">
            <Play className="h-4 w-4" />
          </Button>
          <Button size="lg">
            <Play className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  ),
};

// Loading state
export const LoadingState: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-grid-text">Loading States</h3>
        <div className="flex items-center gap-4">
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initializing...
          </Button>
          <Button variant="secondary" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </Button>
          <Button variant="danger" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Aborting...
          </Button>
        </div>
      </div>
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    children: 'Mission Control',
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interact with the button controls in the panel below to explore all combinations.',
      },
    },
  },
};