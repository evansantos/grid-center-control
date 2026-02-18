import { render } from '@testing-library/react';
import SettingsPage from './page';

describe('SettingsPage', () => {
  it('should not contain inline var(--grid-*) styles', () => {
    const { container } = render(<SettingsPage />);
    const elementsWithStyle = container.querySelectorAll('[style*="var(--grid"]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should not contain inline style attributes', () => {
    const { container } = render(<SettingsPage />);
    const elementsWithStyle = container.querySelectorAll('[style]');
    expect(elementsWithStyle).toHaveLength(0);
  });

  it('should use Grid design tokens instead of inline styles', () => {
    const { container } = render(<SettingsPage />);
    const htmlContent = container.innerHTML;
    
    // Check for Grid design tokens that replaced inline styles
    expect(htmlContent).toMatch(/text-grid-text/);
    expect(htmlContent).toMatch(/text-grid-text-dim/);
  });

  it('should use Card component instead of inline styled div', () => {
    const { container } = render(<SettingsPage />);
    
    // Card components should have specific classes
    const card = container.querySelector('[class*="rounded-lg"][class*="border"]');
    expect(card).toBeInTheDocument();
  });

  it('should render the settings heading', () => {
    const { getByText } = render(<SettingsPage />);
    expect(getByText('Settings')).toBeInTheDocument();
  });

  it('should render the placeholder content', () => {
    const { getByText } = render(<SettingsPage />);
    expect(getByText('Settings page — more options coming soon.')).toBeInTheDocument();
  });

  it('should have proper component structure', () => {
    const { container } = render(<SettingsPage />);
    
    // Should have the main container
    const mainContainer = container.querySelector('.space-y-6');
    expect(mainContainer).toBeInTheDocument();
    
    // Should have the heading with proper classes
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-grid-text');
  });

  it('should use CardContent component properly', () => {
    const { container } = render(<SettingsPage />);
    
    // CardContent should have the p-6 class
    const cardContent = container.querySelector('[class*="p-6"]');
    expect(cardContent).toBeInTheDocument();
  });
});