import { render, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LogSearch } from './log-search';

// Mock the agent meta
vi.mock('@/lib/agent-meta', () => ({
  getAgentDisplay: (agentId: string) => ({
    name: agentId.toUpperCase(),
    emoji: '🤖',
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('LogSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not contain inline var(--grid-*) styles', () => {
    const { container } = render(<LogSearch />);
    const elementsWithStyle = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should not contain raw Tailwind zinc colors', () => {
    const { container } = render(<LogSearch />);
    const htmlContent = container.innerHTML;
    
    // Check for raw Tailwind color patterns that were replaced
    expect(htmlContent).not.toMatch(/bg-zinc-\d+/);
    expect(htmlContent).not.toMatch(/text-zinc-\d+/);
    expect(htmlContent).not.toMatch(/border-zinc-\d+/);
  });

  it('should use Grid design tokens', () => {
    const { container } = render(<LogSearch />);
    const htmlContent = container.innerHTML;
    
    // Check for Grid design tokens
    expect(htmlContent).toMatch(/text-grid-text/);
    expect(htmlContent).toMatch(/text-grid-text-muted/);
    expect(htmlContent).toMatch(/bg-grid-surface/);
    expect(htmlContent).toMatch(/border-grid-border/);
  });

  it('should render search input with proper variant', () => {
    const { container } = render(<LogSearch />);
    const input = container.querySelector('input[placeholder*="Search across all agent logs"]');
    expect(input).toBeInTheDocument();
  });

  it('should render time range filter buttons', () => {
    const { getByText } = render(<LogSearch />);
    
    expect(getByText('1h')).toBeInTheDocument();
    expect(getByText('6h')).toBeInTheDocument();
    expect(getByText('24h')).toBeInTheDocument();
    expect(getByText('7d')).toBeInTheDocument();
    expect(getByText('All')).toBeInTheDocument();
  });

  it('should show empty state when no query', () => {
    const { getByText } = render(<LogSearch />);
    expect(getByText('Search across all agent logs')).toBeInTheDocument();
  });

  it('should use Badge components for roles', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            sessionKey: 'session-123',
            agentId: 'test',
            timestamp: '2024-01-01T00:00:00Z',
            role: 'user',
            content: 'Test message',
            matchHighlight: 'Test match',
          },
        ],
        count: 1,
        searchTimeMs: 10,
      }),
    } as any);

    const { getByPlaceholderText, container } = render(<LogSearch />);
    const input = getByPlaceholderText('Search across all agent logs...');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    
    await waitFor(() => {
      // Check that Badge components are being used (they should have specific classes)
      const badges = container.querySelectorAll('[class*="inline-flex"][class*="rounded-full"]');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});