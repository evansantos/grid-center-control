import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HealthPage from './page';

// Mock the HealthStatus component to avoid external dependencies
vi.mock('@/components/health-status', () => ({
  HealthStatus: () => <div data-testid="health-status">Health Status Component</div>,
}));

describe('HealthPage', () => {
  it('should not contain inline CSS variables', () => {
    const { container } = render(<HealthPage />);

    // Check that no elements have inline styles with var(--grid-*)
    const elementsWithInlineStyles = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithInlineStyles).toHaveLength(0);
  });

  it('should use Grid design tokens instead of inline styles', () => {
    const { container } = render(<HealthPage />);

    const htmlContent = container.innerHTML;
    
    // Should contain Grid design token classes
    expect(htmlContent).toContain('text-grid-text');
    expect(htmlContent).toContain('text-grid-text-dim');
    
    // Should not contain inline styles
    expect(htmlContent).not.toContain('style=');
    expect(htmlContent).not.toContain('var(--grid-text)');
    expect(htmlContent).not.toContain('var(--grid-text-dim)');
  });

  it('should render the page title and description with correct styles', () => {
    render(<HealthPage />);

    // Check title exists and has correct content
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('System Health');
    expect(title).toHaveClass('text-grid-text');

    // Check description exists and has correct content  
    const description = screen.getByText('Real-time monitoring of OpenClaw gateway, agent responsiveness, and system resources.');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-grid-text-dim');
  });

  it('should render the HealthStatus component', () => {
    render(<HealthPage />);
    
    expect(screen.getByTestId('health-status')).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = render(<HealthPage />);

    // Check main container structure
    const mainContainer = container.querySelector('.container.mx-auto.px-6.py-8');
    expect(mainContainer).toBeInTheDocument();

    // Check max-width wrapper
    const maxWidthWrapper = container.querySelector('.max-w-4xl.mx-auto');
    expect(maxWidthWrapper).toBeInTheDocument();

    // Check header section
    const header = container.querySelector('header.mb-8');
    expect(header).toBeInTheDocument();
  });

  it('should not use any raw Tailwind color classes', () => {
    const { container } = render(<HealthPage />);

    const htmlContent = container.innerHTML;
    
    // List of prohibited raw Tailwind color classes that were previously used
    const prohibitedClasses = [
      'text-zinc-200', 'text-zinc-400', 'text-zinc-500', 'text-zinc-600',
      'bg-zinc-800', 'bg-zinc-900', 'border-zinc-800',
      'text-green-400', 'bg-green-500', 'text-red-400', 'bg-red-500',
      'text-yellow-400', 'bg-yellow-500'
    ];

    prohibitedClasses.forEach(className => {
      expect(htmlContent).not.toContain(className);
    });
  });

  it('should use proper semantic HTML structure', () => {
    render(<HealthPage />);

    // Check that proper semantic elements are used
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Check header element exists
    const headerElement = document.querySelector('header');
    expect(headerElement).toBeInTheDocument();
  });
});