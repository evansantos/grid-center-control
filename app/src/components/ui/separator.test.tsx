import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from './separator';

describe('Separator', () => {
  it('renders horizontal by default', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveClass('h-px', 'w-full');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders vertical orientation correctly', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('w-px', 'h-full');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies bg-grid-border styling', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('bg-grid-border');
  });

  it('merges custom className correctly', () => {
    render(<Separator className="custom-class" data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-class');
    // Should still have default classes
    expect(separator).toHaveClass('bg-grid-border', 'h-px', 'w-full');
  });

  it('has correct role attribute from Radix (decorative by default)', () => {
    render(<Separator data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'none');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Separator ref={ref} data-testid="separator" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('can be made non-decorative', () => {
    render(<Separator decorative={false} data-testid="separator" />);
    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'separator');
  });
});