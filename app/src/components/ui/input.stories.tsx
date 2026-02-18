import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Form input component with support for different variants, sizes, and error states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'search'],
      description: 'The visual style variant of the input',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the input',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display below the input',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Default</label>
        <Input placeholder="Default input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Search</label>
        <Input variant="search" placeholder="Search..." />
      </div>
    </div>
  ),
};

// All sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Small</label>
        <Input size="sm" placeholder="Small input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Medium (default)</label>
        <Input size="md" placeholder="Medium input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Large</label>
        <Input size="lg" placeholder="Large input" />
      </div>
    </div>
  ),
};

// Error states
export const ErrorStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Input with Error</label>
        <Input placeholder="Enter your email" error="Email is required" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Search with Error</label>
        <Input variant="search" placeholder="Search..." error="Search query too short" />
      </div>
    </div>
  ),
};

// Form examples
export const FormExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input placeholder="Enter your name" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input type="email" placeholder="Enter your email" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <Input type="password" placeholder="Enter your password" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Search Products</label>
        <Input variant="search" placeholder="Search products..." />
      </div>
    </div>
  ),
};

// Disabled states
export const DisabledStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Disabled Default</label>
        <Input placeholder="Disabled input" disabled />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Disabled Search</label>
        <Input variant="search" placeholder="Disabled search" disabled />
      </div>
    </div>
  ),
};

// Individual variant stories
export const SearchInput: Story = {
  args: {
    variant: 'search',
    placeholder: 'Search...',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter your email',
    error: 'This field is required',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    placeholder: 'Medium input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};