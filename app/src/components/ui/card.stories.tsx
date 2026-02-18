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
        component: 'Versatile container component with variant support. Perfect for organizing information and creating focused content sections. Built with semantic HTML and comprehensive accessibility support.',
      },
    },
    a11y: {
      // Custom accessibility rules for card components
      config: {
        rules: [
          {
            // Ensure proper heading hierarchy in card headers
            id: 'heading-order',
            enabled: true,
          },
          {
            // Verify sufficient color contrast
            id: 'color-contrast',
            enabled: true,
          },
          {
            // Check for proper landmark usage
            id: 'landmark-one-main',
            enabled: false, // Cards are not main landmarks
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'accent', 'glass'],
      description: 'Visual variant affecting styling and emphasis',
      table: {
        type: { summary: 'default | accent | glass' },
        defaultValue: { summary: 'default' },
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes for custom styling',
      table: {
        type: { summary: 'string' },
      },
    },
    children: {
      control: false,
      description: 'Card content - typically CardHeader, CardContent, and CardFooter components',
      table: {
        type: { summary: 'ReactNode' },
      },
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

/**
 * Accessibility-focused card examples demonstrating proper semantic structure,
 * ARIA attributes, and keyboard navigation patterns.
 */
export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold mb-4">Semantic Structure</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card with proper heading hierarchy */}
          <Card role="region" aria-labelledby="system-status-heading">
            <CardHeader>
              <h3 id="system-status-heading" className="font-semibold text-grid-text">
                System Status
              </h3>
              <p className="text-sm text-grid-text-secondary">
                Current operational metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-grid-text">CPU Usage</span>
                  <Badge 
                    variant="success" 
                    role="status" 
                    aria-label="CPU usage is normal at 24%"
                  >
                    24% Normal
                  </Badge>
                </div>
                <div 
                  role="progressbar" 
                  aria-label="Memory usage" 
                  aria-valuenow={67} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                  className="space-y-1"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-grid-text">Memory</span>
                    <span className="text-grid-text-secondary">67%</span>
                  </div>
                  <div className="w-full bg-grid-border rounded-full h-2">
                    <div 
                      className="bg-grid-warning h-2 rounded-full transition-all duration-300" 
                      style={{ width: '67%' }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                size="sm"
                aria-describedby="refresh-help"
              >
                <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                Refresh Data
              </Button>
              <div id="refresh-help" className="sr-only">
                Updates system metrics in real-time
              </div>
            </CardFooter>
          </Card>

          {/* Interactive card with proper focus management */}
          <Card 
            className="cursor-pointer hover:border-grid-accent transition-colors"
            tabIndex={0}
            role="button"
            aria-describedby="card-action-help"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                alert('Card activated!');
              }
            }}
            onClick={() => alert('Card clicked!')}
          >
            <CardHeader>
              <h3 className="font-semibold text-grid-text">Interactive Card</h3>
              <Badge variant="info">Clickable</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-grid-text-secondary">
                This card demonstrates keyboard accessibility. Focus it and press Enter or Space.
              </p>
            </CardContent>
            <div id="card-action-help" className="sr-only">
              Press Enter or Space to activate this card
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Screen Reader Optimizations</h2>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-grid-text">
              Mission Control Alert
            </h3>
            <Badge 
              variant="error" 
              role="alert"
              aria-live="assertive"
            >
              Critical
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-grid-text-secondary">
                <span className="sr-only">Alert details: </span>
                Anomalous readings detected in navigation subsystem. 
                Immediate attention required.
              </p>
              <div className="flex items-start gap-3 p-3 bg-grid-error/10 border border-grid-error/30 rounded">
                <Shield 
                  className="h-5 w-5 text-grid-error mt-0.5" 
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm font-medium text-grid-error">
                    Security Protocol Activated
                  </div>
                  <div className="text-xs text-grid-text-secondary">
                    <span className="sr-only">Time: </span>
                    <time dateTime="2024-02-18T22:30:00Z">
                      Today at 22:30 UTC
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="ghost" 
              size="sm"
              aria-label="Dismiss this alert"
            >
              Dismiss
            </Button>
            <Button 
              variant="danger" 
              size="sm"
              aria-describedby="acknowledge-help"
            >
              Acknowledge Alert
            </Button>
            <div id="acknowledge-help" className="sr-only">
              This will mark the alert as seen and notify the operations team
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of accessible card implementations with proper ARIA attributes, semantic HTML, and keyboard navigation support.',
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
        ],
      },
    },
  },
};

/**
 * Responsive design patterns showing how cards adapt to different screen sizes
 */
export const ResponsivePatterns: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4">Mobile-First Design</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="min-h-[120px]">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-grid-accent/20 rounded-full flex items-center justify-center">
                    <Activity className="h-5 w-5 text-grid-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-medium text-grid-text">Metric {i}</h3>
                    <p className="text-sm text-grid-text-secondary">Value: {i * 42}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-3 text-xs text-grid-text-muted">
          Resize your browser to see responsive behavior: 1 column on mobile, 2 on tablet, 3 on desktop
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Responsive card layouts that adapt gracefully across different screen sizes and devices.',
      },
    },
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

/**
 * Performance considerations for card components
 */
export const PerformanceOptimizations: Story = {
  render: () => (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold mb-4">Virtualized Card List</h2>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-grid-text">Performance Tips</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-grid-text-secondary">
                <div>• Use <code className="text-xs bg-grid-surface px-1 py-0.5 rounded">key</code> props for dynamic lists</div>
                <div>• Consider virtualization for large datasets (&gt;100 cards)</div>
                <div>• Lazy load expensive card content below the fold</div>
                <div>• Use <code className="text-xs bg-grid-surface px-1 py-0.5 rounded">loading="lazy"</code> for images</div>
                <div>• Implement skeleton loading states</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
};

// Interactive playground with enhanced controls
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
        story: 'Interact with the card controls in the panel below to explore all variant combinations. Test with keyboard navigation and screen readers.',
      },
    },
  },
};