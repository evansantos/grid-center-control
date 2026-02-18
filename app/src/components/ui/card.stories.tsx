import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Activity, Settings, Users, TrendingUp, Zap, Shield } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile container component with variant support. Perfect for organizing information and creating focused content sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'accent', 'glass'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: (
      <CardContent>
        <p className="text-grid-text">Default card variant with standard styling</p>
      </CardContent>
    ),
  },
};

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: (
      <CardContent>
        <p className="text-grid-text">Accent card variant with subtle red glow</p>
      </CardContent>
    ),
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: (
      <CardContent>
        <p className="text-grid-text">Glass card variant with backdrop blur effect</p>
      </CardContent>
    ),
  },
};

// All variants side by side
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-6">
      <Card className="w-64">
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-medium text-grid-text">Default</h3>
            <p className="text-sm text-grid-text-secondary">
              Standard card with surface background and grid border
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card variant="accent" className="w-64">
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-medium text-grid-text">Accent</h3>
            <p className="text-sm text-grid-text-secondary">
              Highlighted card with accent border and subtle glow
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card variant="glass" className="w-64">
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-medium text-grid-text">Glass</h3>
            <p className="text-sm text-grid-text-secondary">
              Translucent card with backdrop blur for layered layouts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

// Complete composed card
export const ComposedCard: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-grid-accent/10 rounded-lg">
            <Activity className="h-5 w-5 text-grid-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-grid-text">System Monitor</h3>
            <p className="text-sm text-grid-text-secondary">Real-time metrics</p>
          </div>
        </div>
        <Badge variant="success">Active</Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-grid-text">CPU Usage</p>
              <p className="text-2xl font-bold text-grid-accent">24%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-grid-text">Memory</p>
              <p className="text-2xl font-bold text-grid-success">8.2 GB</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-grid-text">Disk Usage</span>
              <span className="text-grid-text-secondary">342 GB / 1 TB</span>
            </div>
            <div className="w-full bg-grid-border rounded-full h-2">
              <div className="bg-grid-accent h-2 rounded-full" style={{ width: '34%' }} />
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
        <Button size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Stats cards
export const StatsCards: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-grid-text-secondary">Total Users</p>
              <p className="text-3xl font-bold text-grid-text">1,284</p>
            </div>
            <div className="p-3 bg-grid-info/10 rounded-lg">
              <Users className="h-6 w-6 text-grid-info" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-grid-success mr-1" />
            <span className="text-sm text-grid-success font-medium">+12%</span>
            <span className="text-sm text-grid-text-secondary ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card variant="accent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-grid-text-secondary">Power Consumption</p>
              <p className="text-3xl font-bold text-grid-text">847W</p>
            </div>
            <div className="p-3 bg-grid-orange/10 rounded-lg">
              <Zap className="h-6 w-6 text-grid-orange" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <TrendingUp className="h-4 w-4 text-grid-success mr-1" />
            <span className="text-sm text-grid-success font-medium">-5%</span>
            <span className="text-sm text-grid-text-secondary ml-2">efficiency improved</span>
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-grid-text-secondary">Security Score</p>
              <p className="text-3xl font-bold text-grid-text">98%</p>
            </div>
            <div className="p-3 bg-grid-success/10 rounded-lg">
              <Shield className="h-6 w-6 text-grid-success" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-grid-success font-medium">Excellent</span>
            <span className="text-sm text-grid-text-secondary ml-2">no threats detected</span>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

// Nested cards showcase
export const NestedCards: Story = {
  render: () => (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <h2 className="text-xl font-bold text-grid-text">Mission Control Dashboard</h2>
        <p className="text-sm text-grid-text-secondary">Overview of all active operations</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <h3 className="font-semibold text-grid-text">Communications</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-grid-text-secondary">Uplink Status</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grid-text-secondary">Signal Strength</span>
                  <span className="text-sm font-medium text-grid-text">-68 dBm</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="accent">
            <CardHeader>
              <h3 className="font-semibold text-grid-text">Power Systems</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-grid-text-secondary">Main Power</span>
                  <Badge variant="success">Nominal</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grid-text-secondary">Backup Power</span>
                  <span className="text-sm font-medium text-grid-text">87%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
      
      <CardFooter>
        <p className="text-sm text-grid-text-secondary">Last updated: 2 minutes ago</p>
        <Button variant="ghost" size="sm">Refresh</Button>
      </CardFooter>
    </Card>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <CardHeader>
          <h3 className="font-semibold text-grid-text">Card Title</h3>
          <Badge>Status</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-grid-text-secondary">
            This is the card content area. You can customize the variant using the controls below.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">Cancel</Button>
          <Button size="sm">Confirm</Button>
        </CardFooter>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interact with the card controls in the panel below to explore all variant combinations.',
      },
    },
  },
};