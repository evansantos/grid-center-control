import { render } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorsPage from './page';

// Mock the ErrorDashboard component
vi.mock('@/components/error-dashboard', () => ({
  ErrorDashboard: () => <div data-testid="error-dashboard">Error Dashboard Component</div>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ErrorsPage', () => {
  it('should not contain inline var(--grid-*) styles', () => {
    const { container } = render(<ErrorsPage />);
    const elementsWithStyle = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should not contain inline style attributes', () => {
    const { container } = render(<ErrorsPage />);
    const elementsWithStyle = container.querySelectorAll('[style]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should use Grid design tokens instead of inline styles', () => {
    const { container } = render(<ErrorsPage />);
    const htmlContent = container.innerHTML;
    
    // Check for Grid design tokens that replaced inline styles
    expect(htmlContent).toMatch(/bg-grid-bg/);
    expect(htmlContent).toMatch(/bg-grid-surface/);
    expect(htmlContent).toMatch(/border-grid-border/);
    expect(htmlContent).toMatch(/text-grid-text/);
    expect(htmlContent).toMatch(/text-grid-text-muted/);
    expect(htmlContent).toMatch(/font-mono/);
  });

  it('should use proper Next.js Link component', () => {
    const { container } = render(<ErrorsPage />);
    const link = container.querySelector('a[href="/"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('🏠 Dashboard');
  });

  it('should have sticky header with proper classes', () => {
    const { container } = render(<ErrorsPage />);
    const header = container.querySelector('.sticky');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('top-0', 'z-10', 'border-b', 'border-grid-border', 'bg-grid-surface');
  });

  it('should render breadcrumb navigation', () => {
    const { getByText } = render(<ErrorsPage />);
    
    expect(getByText('🏠 Dashboard')).toBeInTheDocument();
    expect(getByText('→')).toBeInTheDocument();
    expect(getByText('Error Monitoring')).toBeInTheDocument();
  });

  it('should render the error dashboard component', () => {
    const { getByTestId } = render(<ErrorsPage />);
    expect(getByTestId('error-dashboard')).toBeInTheDocument();
  });

  it('should use Tailwind classes instead of inline fontFamily', () => {
    const { container } = render(<ErrorsPage />);
    const htmlContent = container.innerHTML;
    
    // Should use font-mono class instead of inline fontFamily
    expect(htmlContent).toMatch(/font-mono/);
    expect(htmlContent).not.toMatch(/fontFamily/);
  });
});