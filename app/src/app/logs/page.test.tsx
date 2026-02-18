import { render } from '@testing-library/react';
import { vi } from 'vitest';
import LogsPage from './page';

// Mock the LogSearch component
vi.mock('@/components/log-search', () => ({
  LogSearch: () => <div data-testid="log-search">Log Search Component</div>,
}));

describe('LogsPage', () => {
  it('should not contain inline var(--grid-*) styles', () => {
    const { container } = render(<LogsPage />);
    const elementsWithStyle = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should not contain raw Tailwind zinc colors', () => {
    const { container } = render(<LogsPage />);
    const htmlContent = container.innerHTML;
    
    // Check for common raw Tailwind color patterns
    expect(htmlContent).not.toMatch(/text-zinc-\d+/);
    expect(htmlContent).not.toMatch(/bg-zinc-\d+/);
    expect(htmlContent).not.toMatch(/border-zinc-\d+/);
  });

  it('should use Grid design tokens', () => {
    const { container } = render(<LogsPage />);
    const htmlContent = container.innerHTML;
    
    // Check for Grid design tokens
    expect(htmlContent).toMatch(/text-grid-text/);
    expect(htmlContent).toMatch(/text-grid-text-muted/);
  });

  it('should render the log search component', () => {
    const { getByTestId } = render(<LogsPage />);
    expect(getByTestId('log-search')).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    const { getByText } = render(<LogsPage />);
    
    expect(getByText('🔍 Log Search')).toBeInTheDocument();
    expect(getByText('Search across all agent session logs')).toBeInTheDocument();
  });
});