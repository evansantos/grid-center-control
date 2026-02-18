import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HealthStatus } from './health-status';

// Mock fetch
global.fetch = vi.fn();

const mockHealthResponse = {
  checks: [
    {
      name: 'Gateway',
      status: 'green' as const,
      message: 'All systems operational',
      details: 'Response time: 45ms',
      latencyMs: 45,
    },
    {
      name: 'Agent Responsiveness',
      status: 'yellow' as const,
      message: 'Slightly elevated response time',
      latencyMs: 150,
    },
    {
      name: 'System Resources',
      status: 'red' as const,
      message: 'High CPU usage detected',
      details: 'CPU: 85%, Memory: 64%',
    },
  ],
  overall: 'yellow' as const,
  timestamp: '2024-02-18T17:30:00.000Z',
};

describe('HealthStatus', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthResponse),
    } as Response);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should not contain inline CSS variables', async () => {
    const { container } = render(<HealthStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
    });

    // Check that no elements have inline styles with var(--grid-*) 
    const elementsWithInlineStyles = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithInlineStyles).toHaveLength(0);
  });

  it('should not use raw Tailwind color classes', async () => {
    const { container } = render(<HealthStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
    });

    // Check for prohibited raw Tailwind classes
    const prohibitedClasses = [
      'bg-green-500', 'text-green-400', 'bg-zinc-900', 'text-zinc-400', 
      'border-zinc-800', 'bg-red-950', 'text-zinc-200', 'text-zinc-500',
      'text-zinc-600', 'bg-zinc-800', 'text-zinc-300'
    ];

    const htmlContent = container.innerHTML;
    prohibitedClasses.forEach(className => {
      expect(htmlContent).not.toContain(className);
    });
  });

  it('should use Grid design tokens correctly', async () => {
    const { container } = render(<HealthStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
    });

    const htmlContent = container.innerHTML;

    // Check for correct Grid token usage in the HTML content
    const expectedClasses = [
      'text-grid-text', 'text-grid-text-dim', 'text-grid-text-muted'
    ];

    expectedClasses.forEach(className => {
      expect(htmlContent).toContain(className);
    });

    // Also check that STATUS_COLORS-related Grid tokens are used
    const statusClasses = ['text-grid-success', 'text-grid-warning', 'text-grid-error'];
    const hasStatusClass = statusClasses.some(className => htmlContent.includes(className));
    expect(hasStatusClass).toBe(true);
  });

  it('should use UI components correctly', async () => {
    render(<HealthStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('Health Checks')).toBeInTheDocument();
    });

    // Check that StatusDot components are rendered (they have role="status")
    const statusDots = screen.getAllByRole('status');
    expect(statusDots.length).toBeGreaterThan(0);

    // Check that refresh button exists and is a proper Button component
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should handle loading state with Skeleton', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<HealthStatus />);
    
    expect(screen.getByText('Loading health status...')).toBeInTheDocument();
    // The Skeleton component should be rendered (has animate-pulse class)
    const skeletonElement = document.querySelector('.animate-pulse');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('should handle error state with Card and Button', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Health Check Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Network error')).toBeInTheDocument();
    
    // Check that retry button exists and is a proper Button component
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should refresh data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    
    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Health Checks')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    // fetch should be called at least twice (initial + refresh)
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should display all health check information correctly', async () => {
    render(<HealthStatus />);

    await waitFor(() => {
      expect(screen.getByText('Gateway')).toBeInTheDocument();
    });

    // Check all health checks are displayed
    expect(screen.getByText('Gateway')).toBeInTheDocument();
    expect(screen.getByText('Agent Responsiveness')).toBeInTheDocument();
    expect(screen.getByText('System Resources')).toBeInTheDocument();

    // Check messages are displayed
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
    expect(screen.getByText('Slightly elevated response time')).toBeInTheDocument();
    expect(screen.getByText('High CPU usage detected')).toBeInTheDocument();

    // Check latency is displayed
    expect(screen.getByText('45ms')).toBeInTheDocument();
    expect(screen.getByText('150ms')).toBeInTheDocument();

    // Check details are displayed
    expect(screen.getByText('Response time: 45ms')).toBeInTheDocument();
    expect(screen.getByText('CPU: 85%, Memory: 64%')).toBeInTheDocument();
  });
});