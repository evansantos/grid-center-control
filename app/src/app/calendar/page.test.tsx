import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarClient } from './client';

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ entries: [] }),
  })
) as jest.Mock;

describe('Calendar Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not contain inline var(--grid-*) styles', () => {
    const { container } = render(<CalendarClient />);
    const elementsWithStyle = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should use Card components instead of inline styled divs', () => {
    const { container } = render(<CalendarClient />);
    
    // Should have Card components with proper classes
    const cards = container.querySelectorAll('[class*="rounded-lg"][class*="border"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should render PageHeader component', () => {
    render(<CalendarClient />);
    
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText(/Month view/)).toBeInTheDocument();
  });

  it('should render view mode buttons with proper Button components', () => {
    render(<CalendarClient />);
    
    expect(screen.getByRole('button', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Week' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Day' })).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    render(<CalendarClient />);
    
    expect(screen.getByRole('button', { name: 'Previous period' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next period' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  });

  it('should switch view modes when buttons are clicked', () => {
    render(<CalendarClient />);
    
    const weekButton = screen.getByRole('button', { name: 'Week' });
    fireEvent.click(weekButton);
    
    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have proper ARIA labels and roles', () => {
    const { container } = render(<CalendarClient />);
    
    const calendarContainer = container.querySelector('[role="application"]');
    expect(calendarContainer).toBeInTheDocument();
    expect(calendarContainer).toHaveAttribute('aria-label', 'Calendar');
  });

  it('should render month view by default', () => {
    render(<CalendarClient />);
    
    // Should show weekday labels
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('should use Badge components for event types', () => {
    const { container } = render(<CalendarClient />);
    
    // Should not have inline badge styles
    const badgeElements = container.querySelectorAll('[class*="rounded-full"]');
    badgeElements.forEach(element => {
      expect(element).not.toHaveAttribute('style');
    });
  });

  it('should handle keyboard navigation', () => {
    const { container } = render(<CalendarClient />);
    
    const calendar = container.querySelector('[role="application"]');
    expect(calendar).toHaveAttribute('tabIndex', '0');
  });

  it('should use design system colors via CSS classes', () => {
    const { container } = render(<CalendarClient />);
    const htmlContent = container.innerHTML;
    
    // Check for Grid design tokens
    expect(htmlContent).toMatch(/text-grid-text/);
    expect(htmlContent).toMatch(/bg-grid-surface/);
    expect(htmlContent).toMatch(/border-grid-border/);
  });

  it('should render current date title', () => {
    render(<CalendarClient />);
    
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it('should make API calls on mount and view changes', () => {
    render(<CalendarClient />);
    
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/calendar?month=')
    );
  });

  it('should handle loading state', () => {
    render(<CalendarClient />);
    
    // Initially shows loading, then disappears when data loads
    expect(screen.queryByText('Loading calendar data...')).toBeInTheDocument();
  });

  it('should use consistent component structure', () => {
    const { container } = render(<CalendarClient />);
    
    // Should have main space-y-4 container
    const mainContainer = container.querySelector('.space-y-4');
    expect(mainContainer).toBeInTheDocument();
    
    // PageHeader should be present
    const pageHeader = container.querySelector('h1');
    expect(pageHeader).toBeInTheDocument();
    expect(pageHeader).toHaveTextContent('Calendar');
  });
});