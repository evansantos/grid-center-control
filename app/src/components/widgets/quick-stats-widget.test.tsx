import { render, screen } from '@testing-library/react';
import { QuickStatsWidget } from './quick-stats-widget';

describe('QuickStatsWidget', () => {
  it('should render with Card components and Grid token classes', () => {
    render(<QuickStatsWidget projectCount={5} />);
    
    // Check that all stat cards are rendered
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Agents Online')).toBeInTheDocument();
    expect(screen.getByText('Tasks Today')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Project count
    expect(screen.getByText('14')).toBeInTheDocument(); // Agents online
    expect(screen.getByText('0')).toBeInTheDocument(); // Tasks today
  });

  it('should use Grid Design System Card components instead of div with inline styles', () => {
    render(<QuickStatsWidget projectCount={3} />);
    
    // Should not have any inline style attributes with var(--grid-*) 
    const divs = screen.getAllByRole('generic');
    divs.forEach(div => {
      const style = div.getAttribute('style');
      if (style) {
        expect(style).not.toMatch(/var\(--grid-/);
      }
    });
  });

  it('should map stat colors to Grid token classes', () => {
    const { container } = render(<QuickStatsWidget projectCount={2} />);
    
    // Check that Grid token classes are used for stat colors
    expect(container.querySelector('.text-grid-info')).toBeInTheDocument(); // Projects
    expect(container.querySelector('.text-grid-success')).toBeInTheDocument(); // Agents Online
    expect(container.querySelector('.text-grid-warning')).toBeInTheDocument(); // Tasks Today
  });

  it('should render the MCP Mission Control footer', () => {
    render(<QuickStatsWidget projectCount={1} />);
    
    expect(screen.getByText(/MCP.*Mission Control/)).toBeInTheDocument();
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('should use Card component with proper structure', () => {
    const { container } = render(<QuickStatsWidget projectCount={1} />);
    
    // Check that Card components are rendered (they should have Grid token classes)
    const cardElements = container.querySelectorAll('.bg-grid-surface, .border-grid-border');
    expect(cardElements.length).toBeGreaterThan(0);
  });
});