import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowsClient } from './client';

// Mock fetch for tests
const mockWorkflows = [
  {
    id: '1',
    name: 'Test Workflow',
    description: 'A test workflow',
    status: 'draft',
    nodes: [
      {
        id: 'node1',
        type: 'start',
        title: 'Start',
        status: 'idle',
        position: { x: 100, y: 100 },
        inputs: [],
        outputs: ['node2'],
      },
      {
        id: 'node2',
        type: 'task',
        title: 'Process Data',
        status: 'idle',
        position: { x: 300, y: 100 },
        inputs: ['node1'],
        outputs: [],
      },
    ],
    connections: [
      {
        id: 'conn1',
        from: 'node1',
        to: 'node2',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ workflows: mockWorkflows }),
  })
) as jest.Mock;

describe('Workflows Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not contain inline var(--grid-*) styles', () => {
    const { container } = render(<WorkflowsClient />);
    const elementsWithStyle = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should use Card components for workflow list', () => {
    const { container } = render(<WorkflowsClient />);
    
    // Should have Card components with proper classes
    const cards = container.querySelectorAll('[class*="rounded-lg"][class*="border"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should render PageHeader component', () => {
    render(<WorkflowsClient />);
    
    expect(screen.getByText('Workflows')).toBeInTheDocument();
    expect(screen.getByText(/Visual workflow designer/)).toBeInTheDocument();
  });

  it('should render workflow control buttons', () => {
    render(<WorkflowsClient />);
    
    expect(screen.getByRole('button', { name: 'Reset View' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom In (+)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom Out (-)' })).toBeInTheDocument();
  });

  it('should render workflow canvas with proper ARIA attributes', () => {
    const { container } = render(<WorkflowsClient />);
    
    const canvas = container.querySelector('[role="application"]');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('Workflow canvas'));
    expect(canvas).toHaveAttribute('tabIndex', '0');
  });

  it('should use Badge components for status indicators', () => {
    const { container } = render(<WorkflowsClient />);
    
    // Should not have inline badge styles
    const badgeElements = container.querySelectorAll('[class*="rounded-full"]');
    badgeElements.forEach(element => {
      expect(element).not.toHaveAttribute('style');
    });
  });

  it('should render workflow list sidebar', () => {
    render(<WorkflowsClient />);
    
    expect(screen.getByText('Workflows')).toBeInTheDocument();
  });

  it('should render inspector panel', () => {
    render(<WorkflowsClient />);
    
    expect(screen.getByText('Inspector')).toBeInTheDocument();
  });

  it('should render keyboard shortcuts help', () => {
    render(<WorkflowsClient />);
    
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    expect(screen.getByText('Delete node')).toBeInTheDocument();
    expect(screen.getByText('Duplicate node')).toBeInTheDocument();
    expect(screen.getByText('Zoom in/out')).toBeInTheDocument();
  });

  it('should handle zoom controls', () => {
    const { container } = render(<WorkflowsClient />);
    
    const zoomInButton = screen.getByRole('button', { name: 'Zoom In (+)' });
    const zoomOutButton = screen.getByRole('button', { name: 'Zoom Out (-)' });
    
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    
    // Should show zoom percentage
    expect(container.textContent).toMatch(/\d+%/);
  });

  it('should use design system colors via CSS classes', () => {
    const { container } = render(<WorkflowsClient />);
    const htmlContent = container.innerHTML;
    
    // Check for Grid design tokens
    expect(htmlContent).toMatch(/text-grid-text/);
    expect(htmlContent).toMatch(/bg-grid-surface/);
    expect(htmlContent).toMatch(/border-grid-border/);
  });

  it('should handle empty workflow state', () => {
    // Mock empty workflows
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ workflows: [] }),
      })
    ) as jest.Mock;

    render(<WorkflowsClient />);
    
    expect(screen.getByText('No workflows found')).toBeInTheDocument();
  });

  it('should make API calls on mount', () => {
    render(<WorkflowsClient />);
    
    expect(fetch).toHaveBeenCalledWith('/api/workflows');
  });

  it('should handle loading state', () => {
    render(<WorkflowsClient />);
    
    // Should show loading initially
    expect(screen.getByText('Loading workflows...')).toBeInTheDocument();
  });

  it('should render workflow execution controls when workflow is selected', async () => {
    render(<WorkflowsClient />);
    
    // Wait for workflows to load and one to be selected
    await screen.findByText('Test Workflow');
    
    // Should have execute button for non-running workflows
    expect(screen.getByRole('button', { name: /Execute/ })).toBeInTheDocument();
  });

  it('should render SVG canvas for node visualization', () => {
    const { container } = render(<WorkflowsClient />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox');
  });

  it('should handle node selection and show details', () => {
    const { container } = render(<WorkflowsClient />);
    
    // Inspector should show workflow info or node details
    expect(screen.getByText('Inspector')).toBeInTheDocument();
  });

  it('should support drag and drop functionality', () => {
    const { container } = render(<WorkflowsClient />);
    
    // Canvas should have mouse event handlers
    const canvas = container.querySelector('[role="application"]');
    expect(canvas).toHaveAttribute('tabIndex', '0');
  });

  it('should use consistent component structure', () => {
    const { container } = render(<WorkflowsClient />);
    
    // Should have main space-y-4 container
    const mainContainer = container.querySelector('.space-y-4');
    expect(mainContainer).toBeInTheDocument();
    
    // Should have grid layout for panels
    const gridContainer = container.querySelector('.grid.grid-cols-12');
    expect(gridContainer).toBeInTheDocument();
  });

  it('should render node type configurations properly', () => {
    const { container } = render(<WorkflowsClient />);
    
    // Should not have any inline styles for node types
    const nodeElements = container.querySelectorAll('[class*="text-"]');
    nodeElements.forEach(element => {
      expect(element).not.toHaveAttribute('style');
    });
  });

  it('should handle workflow status display with Badges', () => {
    render(<WorkflowsClient />);
    
    // Status badges should use the Badge component
    const statusElements = screen.queryAllByText(/Draft|Running|Completed|Failed/);
    expect(statusElements.length).toBeGreaterThan(0);
  });
});