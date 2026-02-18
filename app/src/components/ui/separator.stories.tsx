import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'radio' },
      options: ['horizontal', 'vertical'],
    },
    decorative: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium leading-none">Radix UI</h4>
        <p className="text-sm text-muted-foreground">
          An open source component library optimized for fast development.
        </p>
      </div>
      <Separator {...args} />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-24 items-center space-x-4 text-sm">
      <div>Blog</div>
      <Separator {...args} />
      <div>Docs</div>
      <Separator {...args} />
      <div>Source</div>
    </div>
  ),
};

export const InText: Story = {
  name: 'In Text Flow',
  render: () => (
    <div className="max-w-md">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
        <p className="text-sm text-muted-foreground">
          An open-source UI component library.
        </p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <div>Blog</div>
        <Separator orientation="vertical" />
        <div>Docs</div>
        <Separator orientation="vertical" />
        <div>Source</div>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  name: 'Custom Styling',
  render: () => (
    <div className="w-80 space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Default</h4>
        <Separator />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">With Custom Color</h4>
        <Separator className="bg-grid-info" />
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Thicker</h4>
        <Separator className="h-0.5" />
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm">Vertical Custom</span>
        <Separator orientation="vertical" className="bg-grid-success w-0.5 h-8" />
        <span className="text-sm">Content</span>
      </div>
    </div>
  ),
};

export const NonDecorative: Story = {
  name: 'Non-decorative (Semantic)',
  args: {
    decorative: false,
  },
  render: (args) => (
    <div className="w-80">
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-medium leading-none">Section 1</h4>
        <p className="text-sm text-muted-foreground">First section content.</p>
      </div>
      <Separator {...args} />
      <div className="space-y-2 mt-4">
        <h4 className="text-sm font-medium leading-none">Section 2</h4>
        <p className="text-sm text-muted-foreground">
          Second section content. This separator has semantic meaning.
        </p>
      </div>
    </div>
  ),
};