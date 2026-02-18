import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './table';
import { Badge } from './badge';

const meta: Meta<typeof Table> = {
  title: 'UI/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

// Sample data for stories
const sampleUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'User' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'active', role: 'Editor' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'pending', role: 'User' },
  { id: 5, name: 'David Brown', email: 'david@example.com', status: 'active', role: 'Admin' },
];

export const Basic: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.status}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <button className="text-grid-accent hover:underline text-xs">
                Edit
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const SortableHeaders: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead sortable sortDirection="asc">Name</TableHead>
          <TableHead sortable>Email</TableHead>
          <TableHead sortable sortDirection="desc">Status</TableHead>
          <TableHead sortable>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.status}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              <button className="text-grid-accent hover:underline text-xs">
                Edit
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center text-grid-text-muted py-8">
            No data available
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const CompactVariant: Story = {
  render: () => (
    <Table className="text-[length:var(--font-size-sm)]">
      <TableHeader>
        <TableRow>
          <TableHead className="px-2 py-1">Name</TableHead>
          <TableHead className="px-2 py-1">Email</TableHead>
          <TableHead className="px-2 py-1">Status</TableHead>
          <TableHead className="px-2 py-1">Role</TableHead>
          <TableHead className="px-2 py-1">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="px-2 py-1">{user.name}</TableCell>
            <TableCell className="px-2 py-1">{user.email}</TableCell>
            <TableCell className="px-2 py-1">{user.status}</TableCell>
            <TableCell className="px-2 py-1">{user.role}</TableCell>
            <TableCell className="px-2 py-1">
              <button className="text-grid-accent hover:underline text-[length:var(--font-size-xs)]">
                Edit
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const WithStatusBadges: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sampleUsers.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge
                variant={
                  user.status === 'active'
                    ? 'success'
                    : user.status === 'inactive'
                    ? 'error'
                    : user.status === 'pending'
                    ? 'warning'
                    : 'default'
                }
                size="sm"
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={user.role === 'Admin' ? 'info' : 'outline'}
                size="sm"
              >
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <button className="text-grid-accent hover:underline text-xs">
                Edit
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

// Additional story showing all components working together
export const ComplexTable: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-grid-text">User Management</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="asc">Name</TableHead>
            <TableHead sortable>Email</TableHead>
            <TableHead sortable sortDirection="desc">Status</TableHead>
            <TableHead sortable>Role</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleUsers.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-grid-text-muted">{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.status === 'active'
                      ? 'success'
                      : user.status === 'inactive'
                      ? 'error'
                      : user.status === 'pending'
                      ? 'warning'
                      : 'default'
                  }
                  size="sm"
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.role === 'Admin' ? 'info' : 'outline'}
                  size="sm"
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-grid-text-muted">
                {index % 2 === 0 ? '2 hours ago' : '1 day ago'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button className="text-grid-accent hover:underline text-xs">
                    Edit
                  </button>
                  <button className="text-grid-error hover:underline text-xs">
                    Delete
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
};