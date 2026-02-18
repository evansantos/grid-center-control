import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './dialog';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-grid-info text-white rounded hover:bg-grid-info">
        Open Dialog
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Basic Dialog</DialogTitle>
          <DialogDescription>
            This is a basic dialog example. You can put any content here.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-grid-text">
            This is the main content area of the dialog. You can place forms,
            text, or any other components here.
          </p>
        </div>
        <DialogFooter>
          <DialogClose className="px-4 py-2 bg-grid-surface-hover text-grid-text rounded hover:bg-grid-border">
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ConfirmDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-grid-error text-white rounded hover:bg-grid-error">
        Delete Item
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose className="px-4 py-2 bg-grid-surface-hover text-grid-text rounded hover:bg-grid-border">
            Cancel
          </DialogClose>
          <button className="px-4 py-2 bg-grid-error text-white rounded hover:bg-grid-error">
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-grid-success text-white rounded hover:bg-grid-success">
        Add User
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new user to the system.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-grid-text mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-grid-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-grid-text mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-grid-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-grid-text mb-1">
              Role
            </label>
            <select
              id="role"
              className="w-full px-3 py-2 border border-grid-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>User</option>
              <option>Admin</option>
              <option>Manager</option>
            </select>
          </div>
        </form>
        <DialogFooter>
          <DialogClose className="px-4 py-2 bg-grid-surface-hover text-grid-text rounded hover:bg-grid-border">
            Cancel
          </DialogClose>
          <button className="px-4 py-2 bg-grid-success text-white rounded hover:bg-grid-success">
            Add User
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const NestedContent: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
        View Details
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about the selected project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-grid-text mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Status:</strong> Active</div>
                <div><strong>Created:</strong> January 15, 2024</div>
                <div><strong>Owner:</strong> John Doe</div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-grid-text mb-2">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Tasks:</strong> 24</div>
                <div><strong>Completed:</strong> 18</div>
                <div><strong>Progress:</strong> 75%</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-grid-text mb-2">Description</h3>
            <p className="text-sm text-grid-text-dim">
              This project involves developing a comprehensive design system for our
              application. It includes creating reusable components, establishing
              design tokens, and implementing a consistent visual language across
              all platforms.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-grid-text mb-2">Recent Activity</h3>
            <div className="space-y-2">
              {[
                { action: 'Updated task status', time: '2 hours ago' },
                { action: 'Added new component', time: '1 day ago' },
                { action: 'Created project', time: '1 week ago' },
              ].map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.action}</span>
                  <span className="text-grid-text-dim">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="px-4 py-2 bg-grid-surface-hover text-grid-text rounded hover:bg-grid-border">
            Close
          </DialogClose>
          <button className="px-4 py-2 bg-grid-purple text-white rounded hover:bg-grid-purple">
            Edit Project
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: Story = {
  render: () => {
    const ControlledExample = () => {
      const [open, setOpen] = useState(false);

      return (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-grid-info text-white rounded hover:bg-grid-info"
            >
              Open Dialog
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-grid-text-muted text-white rounded hover:bg-grid-text-muted"
            >
              Close Dialog
            </button>
          </div>
          <p className="text-sm text-grid-text-dim">
            Dialog is currently: <strong>{open ? 'Open' : 'Closed'}</strong>
          </p>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Controlled Dialog</DialogTitle>
                <DialogDescription>
                  This dialog's open state is controlled by external buttons.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-grid-text">
                  You can control this dialog programmatically using the buttons above.
                </p>
              </div>
              <DialogFooter>
                <DialogClose className="px-4 py-2 bg-grid-surface-hover text-grid-text rounded hover:bg-grid-border">
                  Close
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    };

    return <ControlledExample />;
  },
};