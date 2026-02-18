import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from './dropdown-menu';

const meta = {
  title: 'UI/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A dropdown menu component built with Radix UI primitives, featuring keyboard navigation and customizable styling.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    // DropdownMenu is a compound component, so we don't expose individual props here
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-3 py-2 bg-grid-accent text-white rounded-md hover:bg-grid-accent/90">
        Open Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithLabelsAndGroups: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-3 py-2 bg-grid-accent text-white rounded-md hover:bg-grid-accent/90">
        Account Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Personal</DropdownMenuLabel>
          <DropdownMenuItem>View Profile</DropdownMenuItem>
          <DropdownMenuItem>Edit Profile</DropdownMenuItem>
          <DropdownMenuItem>Preferences</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team Settings</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-grid-error hover:bg-grid-error/10 focus:bg-grid-error/10">
          Delete Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const MultipleGroups: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-3 py-2 bg-grid-accent text-white rounded-md hover:bg-grid-accent/90">
        File Actions
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>File</DropdownMenuLabel>
          <DropdownMenuItem>New File</DropdownMenuItem>
          <DropdownMenuItem>Open File</DropdownMenuItem>
          <DropdownMenuItem>Save File</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Edit</DropdownMenuLabel>
          <DropdownMenuItem>Copy</DropdownMenuItem>
          <DropdownMenuItem>Cut</DropdownMenuItem>
          <DropdownMenuItem>Paste</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuItem>Zoom In</DropdownMenuItem>
          <DropdownMenuItem>Zoom Out</DropdownMenuItem>
          <DropdownMenuItem>Full Screen</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Simple: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-3 py-2 bg-grid-accent text-white rounded-md hover:bg-grid-accent/90">
        Options
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Archive</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 border-2 border-grid-border rounded-lg hover:border-grid-accent transition-colors">
        Custom Styled Menu
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Recent Actions</DropdownMenuLabel>
          <DropdownMenuItem className="px-3 py-2">
            <div className="flex flex-col">
              <span className="font-medium">Create Project</span>
              <span className="text-grid-text-muted text-[length:var(--font-size-xs)]">Start a new project from scratch</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="px-3 py-2">
            <div className="flex flex-col">
              <span className="font-medium">Import Template</span>
              <span className="text-grid-text-muted text-[length:var(--font-size-xs)]">Use an existing template</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="px-3 py-2 text-grid-text-muted">
          View All Projects
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    
    return (
      <div className="space-y-4">
        <div className="text-xs text-grid-text-muted">
          Menu is currently: {open ? 'Open' : 'Closed'}
        </div>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger className="px-3 py-2 bg-grid-accent text-white rounded-md hover:bg-grid-accent/90">
            Controlled Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setOpen(false)}>
              Close Menu
            </DropdownMenuItem>
            <DropdownMenuItem>Keep Open</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert('Action performed!')}>
              Perform Action
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button 
          onClick={() => setOpen(!open)}
          className="px-3 py-1 text-xs border border-grid-border rounded hover:bg-grid-surface"
        >
          Toggle Menu Externally
        </button>
      </div>
    );
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-xs text-grid-text-muted max-w-sm">
        Click to open, then use arrow keys to navigate, Enter to select, and Escape to close.
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="px-3 py-2 bg-grid-accent text-white rounded-md hover:bg-grid-accent/90">
          Keyboard Navigation Demo
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Navigate with arrow keys</DropdownMenuLabel>
          <DropdownMenuItem>First Item</DropdownMenuItem>
          <DropdownMenuItem>Second Item</DropdownMenuItem>
          <DropdownMenuItem>Third Item</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Fourth Item</DropdownMenuItem>
          <DropdownMenuItem>Fifth Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
};