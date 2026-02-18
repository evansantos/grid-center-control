import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TokenAnalyticsPage from './page';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockTokenAnalytics = {
  overview: {
    totalTokens: 150000,
    totalCost: 45.75,
    totalRequests: 1250,
    avgCostPerRequest: 0.0366,
  },
  models: [
    {
      model: 'anthropic/claude-sonnet-3.5',
      inputTokens: 80000,
      outputTokens: 45000,
      totalTokens: 125000,
      cost: 38.50,
      requests: 850,
      avgTokensPerRequest: 147,
    },
    {
      model: 'anthropic/claude-haiku-3',
      inputTokens: 15000,
      outputTokens: 10000,
      totalTokens: 25000,
      cost: 7.25,
      requests: 400,
      avgTokensPerRequest: 62,
    },
  ],
  trends: {
    tokens: 'up',
    cost: 'up',
    requests: 'up',
  },
  period: {
    start: '2024-02-17T00:00:00Z',
    end: '2024-02-18T00:00:00Z',
  },
};

describe('TokenAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockTokenAnalytics),
    });
  });

  it('renders loading state initially', () => {
    render(<TokenAnalyticsPage />);
    expect(screen.getByText('Loading token usage and cost data...')).toBeInTheDocument();
  });

  it('renders token analytics with overview stats after loading', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Token Analytics')).toBeInTheDocument();
    });

    // Check overview statistics - use getAllByText to handle duplicates
    expect(screen.getAllByText('150.0K')).toHaveLength(2); // Total tokens (overview + table)
    expect(screen.getAllByText('$45.7500')).toHaveLength(2); // Total cost (overview + table)
    expect(screen.getAllByText('1.3K')).toHaveLength(2); // Total requests (overview + table)
    expect(screen.getByText('$0.0366')).toBeInTheDocument(); // Avg cost per request
  });

  it('displays model usage breakdown table', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Usage by Model')).toBeInTheDocument();
    });

    // Check model data
    expect(screen.getByText('anthropic/claude-sonnet-3.5')).toBeInTheDocument();
    expect(screen.getByText('anthropic/claude-haiku-3')).toBeInTheDocument();

    // Check for "Most Used" badge on first model
    expect(screen.getByText('Most Used')).toBeInTheDocument();
  });

  it('allows switching between time periods', async () => {
    const user = userEvent.setup();
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
    });

    // Click 7 days period
    const sevenDaysButton = screen.getByText('Last 7 Days');
    await user.click(sevenDaysButton);

    // Should fetch with new period
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics/tokens?period=7d');
    });
  });

  it('handles refresh button click', async () => {
    const user = userEvent.setup();
    
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      expect(refreshButton).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    // Should make additional fetch call
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('displays period information correctly', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Period:/)).toBeInTheDocument();
    });

    // Should show the period from mock data
    expect(screen.getByText('24h')).toBeInTheDocument();
  });

  it('formats currency values correctly', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      // Check that costs are formatted as currency with 4 decimal places
      expect(screen.getByText('$38.5000')).toBeInTheDocument();
      expect(screen.getByText('$7.2500')).toBeInTheDocument();
    });
  });

  it('formats large numbers correctly', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      // Check token formatting (150K, 125K, etc.)
      expect(screen.getByText('125.0K')).toBeInTheDocument(); // First model total tokens
      expect(screen.getByText('25.0K')).toBeInTheDocument(); // Second model total tokens
    });
  });

  it('shows cost color coding based on amount', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      const costCells = screen.getAllByText(/\$\d+\.\d{4}/);
      expect(costCells.length).toBeGreaterThan(0);
    });

    // The high cost ($38.50) should have red color class
    const highCostElement = screen.getByText('$38.5000');
    expect(highCostElement).toHaveClass('text-red-400');

    // The lower cost ($7.25) should have yellow color class
    const mediumCostElement = screen.getByText('$7.2500');
    expect(mediumCostElement).toHaveClass('text-yellow-400');
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      // Should still show the basic structure
      expect(screen.getByText('Token Analytics')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to fetch token data:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('shows empty state when no model data is available', async () => {
    mockFetch.mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        ...mockTokenAnalytics,
        models: [],
      }),
    });

    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      expect(screen.getByText('No token usage data available for this period')).toBeInTheDocument();
    });
  });

  it('calculates totals correctly in footer', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      // Check that footer shows correct totals
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    // Total requests should be sum of all models - use getAllByText for duplicates
    const totalRequestsElements = screen.getAllByText('1.3K'); // 850 + 400 = 1250 -> 1.3K
    expect(totalRequestsElements.length).toBe(2); // Should appear in overview and footer

    // Total cost should match overview
    const totalCostInFooter = screen.getAllByText('$45.7500');
    expect(totalCostInFooter.length).toBeGreaterThan(1); // Should appear in overview and footer
  });

  it('updates automatically with interval', async () => {
    vi.useFakeTimers();
    
    render(<TokenAnalyticsPage />);

    // Initial call
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Fast forward 60 seconds
    vi.advanceTimersByTime(60000);

    // Should have made another call
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('has proper accessibility attributes', async () => {
    render(<TokenAnalyticsPage />);

    await waitFor(() => {
      // Check for proper table structure
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    // Check for column headers
    expect(screen.getByRole('columnheader', { name: /Model/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Cost/i })).toBeInTheDocument();
  });
});