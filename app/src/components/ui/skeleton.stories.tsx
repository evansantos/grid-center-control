import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Skeleton is a loading placeholder component with animated shimmer/pulse effects.
It provides different variants for various loading states and supports multiple instances with the count prop.

**Features:**
- Animated shimmer/pulse effect
- Multiple variants for different UI elements
- Customizable count for multiple skeletons
- Responsive design with Tailwind classes
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['text', 'circle', 'card', 'table-row'],
      description: 'The visual variant of the skeleton',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
      },
    },
    count: {
      control: { type: 'number', min: 1, max: 10, step: 1 },
      description: 'Number of skeleton elements to render',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default text skeleton with standard height and full width.',
      },
    },
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
  },
  parameters: {
    docs: {
      description: {
        story: 'Text skeleton variant for loading text content.',
      },
    },
  },
};

export const Circle: Story = {
  args: {
    variant: 'circle',
    className: 'w-12 h-12',
  },
  parameters: {
    docs: {
      description: {
        story: 'Circle skeleton variant for avatars or profile pictures.',
      },
    },
  },
};

export const Card: Story = {
  args: {
    variant: 'card',
  },
  parameters: {
    docs: {
      description: {
        story: 'Card skeleton variant for loading card components.',
      },
    },
  },
};

export const TableRow: Story = {
  args: {
    variant: 'table-row',
  },
  parameters: {
    docs: {
      description: {
        story: 'Table row skeleton variant for loading table rows.',
      },
    },
  },
};

export const MultipleSkeletons: Story = {
  args: {
    variant: 'text',
    count: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple skeleton elements rendered using the count prop.',
      },
    },
  },
};

export const LoadingProfile: Story = {
  render: () => (
    <div className="flex items-start space-x-4">
      <Skeleton variant="circle" className="w-12 h-12" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using skeletons to create a loading profile layout.',
      },
    },
  },
};

export const LoadingCard: Story = {
  render: () => (
    <div className="w-80 p-6 border rounded-lg space-y-4">
      <Skeleton variant="card" className="h-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using skeletons to create a loading card layout with image, text, and buttons.',
      },
    },
  },
};

export const LoadingTable: Story = {
  render: () => (
    <div className="w-full space-y-2">
      <Skeleton variant="table-row" />
      <Skeleton variant="table-row" />
      <Skeleton variant="table-row" />
      <Skeleton variant="table-row" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of using table-row skeletons for loading table data.',
      },
    },
  },
};

export const CustomSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-grid-text-secondary">Small text lines</p>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-grid-text-secondary">Large text lines</p>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-4/5" />
      </div>
      <div className="space-y-2">
        <p className="text-sm text-grid-text-secondary">Various circle sizes</p>
        <div className="flex space-x-4 items-center">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="circle" className="w-12 h-12" />
          <Skeleton variant="circle" className="w-16 h-16" />
          <Skeleton variant="circle" className="w-20 h-20" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of custom sizing using className overrides.',
      },
    },
  },
};