import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MetricsDashboardPage from './page';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockDashboardData = {
  metrics: {
    performance: {
      uptime: 432000, // 5 days
      responseTime: 250,
      throughput: 45,
      errorRate: 2.1,
    },
    resources: {
      memoryUsage: 68,
      cpuUsage: 42,
      diskUsage: 35,
      networkIO: 1048576, // 1MB
    },
    agents: {
      totalAgents: 8,
      activeAgents: 6,
      idleAgents: 2,
      errorAgents: 0,
    },
    activity: {
      totalSessions: 1250,
      totalMessages: 15420,
      totalTokens: 2500000,
      totalCost: 750.25,
    },
  },
  alerts: [
    {
      id: 'alert-1',
      type: 'warning',
      metric: 'Memory Usage',
      message: 'Memory usage is approaching 70% threshold',
      timestamp: '2024-02-18T20:45:00Z',
      acknowledged: false,
    },
    {
      id: 'alert-2',
      type: 'info',
      metric: 'Agent Status',
      message: 'New agent GRID has joined the system',
      timestamp: '2024-02-18T20:30:00Z',
      acknowledged: true,
    },
  ],
  trends: {
    performance: 'up',
    resources: 'down',
    activity: 'up',
  },
};

describe('MetricsDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/acknowledge')) {
        return Promise.resolve({ json: vi.fn().mockResolvedValue({ success: true }) });
      }
      return Promise.resolve({ json: vi.fn().mockResolvedValue(mockDashboardData) });
    });
  });

  it('renders loading state initially', () => {
    render(<MetricsDashboardPage />);
    expect(screen.getByText('Loading system metrics and performance data...')).toBeInTheDocument();
  });

  it('renders metrics dashboard with all sections after loading', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Metrics Dashboard')).toBeInTheDocument();
    });

    // Check section headings
    expect(screen.getByText('System Performance')).toBeInTheDocument();
    expect(screen.getByText('Resource Usage')).toBeInTheDocument();
    expect(screen.getByText('Agent Status')).toBeInTheDocument();
    expect(screen.getByText('Activity Overview')).toBeInTheDocument();
  });

  it('displays performance metrics correctly', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      // System uptime (5 days = 5d 0h)
      expect(screen.getByText('5d 0h')).toBeInTheDocument();
      
      // Response time
      expect(screen.getByText('250ms')).toBeInTheDocument();
      
      // Throughput  
      expect(screen.getByText('45/s')).toBeInTheDocument();
      
      // Error rate
      expect(screen.getByText('2.1%')).toBeInTheDocument();
    });
  });

  it('displays resource usage with color-coded warnings', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('68%')).toBeInTheDocument(); // Memory
      expect(screen.getByText('42%')).toBeInTheDocument(); // CPU
      expect(screen.getByText('35%')).toBeInTheDocument(); // Disk
      expect(screen.getByText('1.0MB')).toBeInTheDocument(); // Network I/O
    });

    // Memory usage (68%) should show as warning (> 60%)
    const memoryCard = screen.getByText('68%').closest('[class*="stat"]');
    expect(memoryCard).toHaveClass('border-grid-warning/30');
  });

  it('shows active alerts section when alerts exist', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('🚨 Active Alerts')).toBeInTheDocument();
    });

    // Should show unacknowledged alert
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory usage is approaching 70% threshold')).toBeInTheDocument();

    // Should show alert badge with count (only unacknowledged)
    expect(screen.getByText('1')).toBeInTheDocument(); // Badge count
  });

  it('allows acknowledging alerts', async () => {
    const user = userEvent.setup();
    
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Ack')).toBeInTheDocument();
    });

    const ackButton = screen.getByText('Ack');
    await user.click(ackButton);

    // Should call acknowledge API
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/analytics/alerts/alert-1/acknowledge',
      { method: 'POST' }
    );
  });

  it('toggles auto-refresh functionality', async () => {
    const user = userEvent.setup();
    
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Auto ON')).toBeInTheDocument();
    });

    const autoButton = screen.getByText('Auto ON');
    await user.click(autoButton);

    expect(screen.getByText('Auto OFF')).toBeInTheDocument();
  });

  it('handles manual refresh', async () => {
    const user = userEvent.setup();
    
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    // Should make additional API call
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('formats numbers correctly', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      // Activity metrics should be formatted
      expect(screen.getByText('1.3K')).toBeInTheDocument(); // 1250 sessions
      expect(screen.getByText('15.4K')).toBeInTheDocument(); // 15420 messages  
      expect(screen.getByText('2.5M')).toBeInTheDocument(); // 2.5M tokens
      expect(screen.getByText('$750.25')).toBeInTheDocument(); // Cost
    });
  });

  it('shows agent status distribution', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('8')).toBeInTheDocument(); // Total agents
      expect(screen.getByText('6')).toBeInTheDocument(); // Active agents
      expect(screen.getByText('2')).toBeInTheDocument(); // Idle agents
      expect(screen.getByText('0')).toBeInTheDocument(); // Error agents
    });
  });

  it('applies correct color coding for different metrics', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      // Error rate (2.1%) should be green (< 5%)
      const errorRateCard = screen.getByText('2.1%').closest('[class*="border-grid-success"]');
      expect(errorRateCard).toBeInTheDocument();

      // Memory usage (68%) should be yellow (60-80%)
      const memoryCard = screen.getByText('68%').closest('[class*="border-grid-warning"]');
      expect(memoryCard).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<MetricsDashboardPage />);

    await waitFor(() => {
      // Should still show the basic structure
      expect(screen.getByText('Metrics Dashboard')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch dashboard data:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('updates with auto-refresh interval', async () => {
    vi.useFakeTimers();
    
    render(<MetricsDashboardPage />);

    // Initial call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Fast forward 10 seconds
    vi.advanceTimersByTime(10000);

    // Should have made another call
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('shows last updated timestamp', async () => {
    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('handles empty alerts gracefully', async () => {
    mockFetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ...mockDashboardData,
        alerts: [],
      }),
    });

    render(<MetricsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Metrics Dashboard')).toBeInTheDocument();
    });

    // Should not show alerts section
    expect(screen.queryByText('🚨 Active Alerts')).not.toBeInTheDocument();
  });

  it('formats uptime correctly for different durations', async () => {
    // Test different uptime values
    const testCases = [
      { seconds: 300, expected: '5m' }, // 5 minutes
      { seconds: 3900, expected: '1h 5m' }, // 1 hour 5 minutes
      { seconds: 90000, expected: '1d 1h' }, // 1 day 1 hour
    ];

    for (const testCase of testCases) {
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          ...mockDashboardData,
          metrics: {
            ...mockDashboardData.metrics,
            performance: {
              ...mockDashboardData.metrics.performance,
              uptime: testCase.seconds,
            },
          },
        }),
      });

      const { rerender } = render(<MetricsDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(testCase.expected)).toBeInTheDocument();
      });

      rerender(<div />); // Clear
    }
  });
});