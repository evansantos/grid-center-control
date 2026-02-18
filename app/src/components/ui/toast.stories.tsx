import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from './button';
import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastViewport,
} from './toast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toast component for displaying notifications built with Radix UI.',
      },
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'error'],
      description: 'The visual variant of the toast',
    },
    open: {
      control: 'boolean',
      description: 'Whether the toast is open',
    },
    duration: {
      control: 'number',
      description: 'Duration in milliseconds before auto-dismiss',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

// Default Toast
export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Notification</ToastTitle>
      <ToastDescription>This is a default notification message.</ToastDescription>
      <ToastClose />
    </Toast>
  ),
};

// Success Toast
export const Success: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    variant: 'success',
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Success!</ToastTitle>
      <ToastDescription>Your action was completed successfully.</ToastDescription>
      <ToastClose />
    </Toast>
  ),
};

// Error Toast
export const Error: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    variant: 'error',
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Error</ToastTitle>
      <ToastDescription>Something went wrong. Please try again.</ToastDescription>
      <ToastClose />
    </Toast>
  ),
};

// Toast with Action
export const WithAction: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>File deleted</ToastTitle>
      <ToastDescription>Your file has been moved to trash.</ToastDescription>
      <ToastAction altText="Undo action">
        Undo
      </ToastAction>
    </Toast>
  ),
};

// Auto Dismiss Toast
export const AutoDismiss: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    duration: 3000,
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Auto-dismiss</ToastTitle>
      <ToastDescription>This toast will auto-dismiss in 3 seconds.</ToastDescription>
    </Toast>
  ),
};

// Long Content Toast
export const LongContent: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
  render: (args) => (
    <Toast {...args}>
      <ToastTitle>Update Available</ToastTitle>
      <ToastDescription>
        A new version of the application is available with improved performance, 
        bug fixes, and new features. Would you like to update now?
      </ToastDescription>
      <ToastAction altText="Update now">
        Update
      </ToastAction>
      <ToastClose />
    </Toast>
  ),
};

// Interactive Demo
const ToastDemo = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: number;
    title: string;
    description: string;
    variant?: 'default' | 'success' | 'error';
    action?: boolean;
  }>>([]);

  const addToast = (
    title: string,
    description: string,
    variant?: 'default' | 'success' | 'error',
    action = false
  ) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant, action }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => addToast('Default', 'This is a default notification.')}>
          Show Default
        </Button>
        <Button 
          onClick={() => addToast('Success!', 'Operation completed successfully.', 'success')}
        >
          Show Success
        </Button>
        <Button 
          onClick={() => addToast('Error', 'Something went wrong.', 'error')}
        >
          Show Error
        </Button>
        <Button 
          onClick={() => addToast('With Action', 'File deleted.', 'default', true)}
        >
          With Action
        </Button>
      </div>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          open={true}
          onOpenChange={() => removeToast(toast.id)}
          variant={toast.variant}
          duration={5000}
        >
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastDescription>{toast.description}</ToastDescription>
          {toast.action && (
            <ToastAction altText="Undo action">
              Undo
            </ToastAction>
          )}
          <ToastClose />
        </Toast>
      ))}
    </>
  );
};

export const InteractiveDemo: Story = {
  render: () => <ToastDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing different toast variants. Click the buttons to trigger toasts.',
      },
    },
  },
};

// Variants Overview
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Toast open={true} onOpenChange={() => {}}>
        <ToastTitle>Default Toast</ToastTitle>
        <ToastDescription>This is the default variant.</ToastDescription>
        <ToastClose />
      </Toast>

      <Toast open={true} onOpenChange={() => {}} variant="success">
        <ToastTitle>Success Toast</ToastTitle>
        <ToastDescription>This is the success variant.</ToastDescription>
        <ToastClose />
      </Toast>

      <Toast open={true} onOpenChange={() => {}} variant="error">
        <ToastTitle>Error Toast</ToastTitle>
        <ToastDescription>This is the error variant.</ToastDescription>
        <ToastClose />
      </Toast>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all available toast variants.',
      },
    },
  },
};