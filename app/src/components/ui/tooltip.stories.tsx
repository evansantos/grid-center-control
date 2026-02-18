import type { Meta, StoryObj } from '@storybook/react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './tooltip';
import { Button } from './button';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    delayDuration: {
      control: 'number',
      description: 'The delay duration in milliseconds before the tooltip shows',
      defaultValue: 200,
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex items-center justify-center min-h-[200px] p-8">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="secondary">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithDifferentSides: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const WithCustomContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Custom content</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">Custom tooltip</p>
          <p className="text-sm">
            This tooltip has custom content with multiple paragraphs and custom styling.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button variant="secondary">No delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Instant tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button variant="secondary">500ms delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delayed tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button variant="secondary">1s delay</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Very delayed tooltip</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const OnDifferentElements: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Button with tooltip</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a button tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm underline cursor-help">
            Hover over this text
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a text tooltip</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-8 h-8 bg-grid-info rounded-full cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a div tooltip</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">Long content</Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-sm">
        <div className="space-y-2">
          <p className="font-medium">Detailed Information</p>
          <p className="text-sm">
            This is a longer tooltip content that demonstrates how the tooltip
            handles multiple lines of text and provides detailed information
            to the user when they hover over the trigger element.
          </p>
          <p className="text-xs text-grid-text-dim">
            Additional context or metadata can be shown here.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
};