import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardGrid } from './dashboard-grid';

import { vi } from 'vitest';

// Mock useIsMobile hook
vi.mock('@/lib/useMediaQuery', () => ({
  useIsMobile: () => false,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('DashboardGrid', () => {
  const mockChildren = {
    'projects': <div>Projects Widget</div>,
    'quick-stats': <div>Quick Stats Widget</div>,
    'recommendations': <div>Recommendations Widget</div>,
    'recent-activity': <div>Recent Activity Widget</div>,
    'task-distribution': <div>Task Distribution Widget</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with Card components and Grid token classes', () => {
    render(<DashboardGrid>{mockChildren}</DashboardGrid>);
    
    // Check that header is rendered
    expect(screen.getByText('Mission Control')).toBeInTheDocument();
    expect(screen.getByText('MCP 🔴 Operations Dashboard')).toBeInTheDocument();
    
    // Check that all widgets are rendered
    expect(screen.getByText('Projects Widget')).toBeInTheDocument();
    expect(screen.getByText('Quick Stats Widget')).toBeInTheDocument();
  });

  it('should use Grid token classes instead of inline styles', () => {
    const { container } = render(<DashboardGrid>{mockChildren}</DashboardGrid>);
    
    // Should not have inline style attributes with var(--grid-*) on text elements
    const textElements = screen.getAllByText(/Mission Control|Operations Dashboard/);
    textElements.forEach(element => {
      const style = element.getAttribute('style');
      if (style) {
        expect(style).not.toMatch(/var\(--grid-/);
      }
    });
    
    // Header should use Grid token classes
    expect(container.querySelector('.text-grid-text')).toBeInTheDocument();
    expect(container.querySelector('.text-grid-text-muted')).toBeInTheDocument();
  });

  it('should use Button components for preset selection', () => {
    render(<DashboardGrid>{mockChildren}</DashboardGrid>);
    
    // Check that preset buttons are rendered
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Compact')).toBeInTheDocument();
    expect(screen.getByText('Wide')).toBeInTheDocument();
    
    // Check that they are proper Button components (should have button element)
    const defaultButton = screen.getByRole('button', { name: 'Default' });
    expect(defaultButton).toBeInTheDocument();
  });

  it('should use Card components for widget containers', () => {
    const { container } = render(<DashboardGrid>{mockChildren}</DashboardGrid>);
    
    // Widget containers should use Card component classes
    const cardElements = container.querySelectorAll('.bg-grid-surface, .border-grid-border');
    expect(cardElements.length).toBeGreaterThan(0);
  });

  it('should handle preset changes correctly', () => {
    render(<DashboardGrid>{mockChildren}</DashboardGrid>);
    
    const compactButton = screen.getByRole('button', { name: 'Compact' });
    fireEvent.click(compactButton);
    
    // Should save to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('grid-dashboard-layout', 'Compact');
  });

  it('should maintain grid layout logic', () => {
    const { container } = render(<DashboardGrid>{mockChildren}</DashboardGrid>);
    
    // Grid container should still have proper grid layout
    const gridContainer = container.querySelector('[style*="display: grid"]');
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveStyle({
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
    });
  });

  it('should not have inline styles with Grid CSS variables', () => {
    const { container } = render(<DashboardGrid>{mockChildren}</DashboardGrid>);
    
    // Check that no element uses inline styles with var(--grid-*) for colors/backgrounds
    const allElements = container.querySelectorAll('*');
    allElements.forEach(element => {
      const style = element.getAttribute('style');
      if (style && style.includes('var(--grid-')) {
        // Only grid layout styles should remain
        expect(style).not.toMatch(/background.*var\(--grid-/);
        expect(style).not.toMatch(/color.*var\(--grid-/);
        expect(style).not.toMatch(/border.*var\(--grid-/);
      }
    });
  });
});