import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorDashboard } from './error-dashboard';

// Mock agent metadata
vi.mock('@/lib/agent-meta', () => ({
  AGENT_DISPLAY: {
    test: { name: 'Test Agent', emoji: '🧪' },
    grid: { name: 'Grid Agent', emoji: '📊' },
  },
}));

// Mock fetch
global.fetch = vi.fn();

const mockErrorData = {
  errors: [
    {
      agent: 'test',
      sessionId: 'session-123',
      timestamp: '2024-01-01T00:00:00Z',
      type: 'tool_error',
      message: 'Test error message',
      severity: 'high',
    },
  ],
  summary: {
    total: 1,
    byAgent: { test: 1 },
    byType: { tool_error: 1 },
  },
};

describe('ErrorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockErrorData,
    } as any);
  });

  it('should not contain inline var(--grid-*) styles', async () => {
    const { container } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
    });

    const elementsWithStyle = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should not contain inline style attributes', async () => {
    const { container } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
    });

    const elementsWithStyle = container.querySelectorAll('[style]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should use Grid design tokens', async () => {
    const { container } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
    });

    const htmlContent = container.innerHTML;
    
    // Check for Grid design tokens
    expect(htmlContent).toMatch(/bg-grid-bg/);
    expect(htmlContent).toMatch(/bg-grid-surface/);
    expect(htmlContent).toMatch(/text-grid-text/);
    expect(htmlContent).toMatch(/text-grid-text-muted/);
    expect(htmlContent).toMatch(/border-grid-border/);
    expect(htmlContent).toMatch(/text-grid-error/);
    expect(htmlContent).toMatch(/text-grid-warning/);
  });

  it('should use Card components instead of inline styled divs', async () => {
    const { container } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
    });

    // Should have Card components (they have specific classes)
    const cards = container.querySelectorAll('[class*="rounded-lg"][class*="border"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should use Badge components for error types and severity', async () => {
    const { container } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
    });

    // Badge components should have specific classes
    const badges = container.querySelectorAll('[class*="inline-flex"][class*="rounded-full"]');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should use Button components instead of inline styled buttons', async () => {
    const { container } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(container.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
    });

    const refreshButton = container.querySelector('button:has-text("Refresh")');
    if (refreshButton) {
      // Button should have design system classes, not inline styles
      expect(refreshButton.getAttribute('style')).toBeFalsy();
    }
  });

  it('should render error statistics', async () => {
    const { getByText } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(getByText('1')).toBeInTheDocument(); // Total errors
      expect(getByText('Total Errors Found')).toBeInTheDocument();
      expect(getByText('Affected Agents')).toBeInTheDocument();
      expect(getByText('Error Categories')).toBeInTheDocument();
    });
  });

  it('should open modal when error is clicked', async () => {
    const { container, getByText } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(getByText('Test error message')).toBeInTheDocument();
    });

    const errorRow = container.querySelector('[class*="cursor-pointer"]');
    if (errorRow) {
      fireEvent.click(errorRow);
      
      await waitFor(() => {
        expect(getByText('Test Agent Error Details')).toBeInTheDocument();
      });
    }
  });

  it('should show empty state when no errors', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [],
        summary: { total: 0, byAgent: {}, byType: {} },
      }),
    } as any);

    const { getByText } = render(<ErrorDashboard />);
    
    await waitFor(() => {
      expect(getByText('All Clear!')).toBeInTheDocument();
      expect(getByText('No errors found in the selected time range and filters.')).toBeInTheDocument();
    });
  });
});