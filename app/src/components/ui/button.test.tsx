import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-grid-accent'); // primary variant default
  });

  it('applies primary variant classes correctly', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-grid-accent', 'text-white');
  });

  it('applies secondary variant classes correctly', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('border', 'border-grid-border', 'bg-grid-surface');
  });

  it('applies ghost variant classes correctly', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button', { name: /ghost/i });
    expect(button).toHaveClass('bg-transparent', 'text-grid-text');
  });

  it('applies danger variant classes correctly', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button', { name: /danger/i });
    expect(button).toHaveClass('bg-grid-error', 'text-white');
  });

  it('applies small size classes correctly', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('text-xs', 'px-2', 'py-1');
  });

  it('applies medium size classes correctly', () => {
    render(<Button size="md">Medium</Button>);
    const button = screen.getByRole('button', { name: /medium/i });
    expect(button).toHaveClass('text-xs', 'px-3', 'py-1.5');
  });

  it('applies large size classes correctly', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('text-sm', 'px-4', 'py-2');
  });

  it('handles disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
  });

  it('merges custom className correctly', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: /custom/i });
    expect(button).toHaveClass('custom-class');
    // Should still have default classes
    expect(button).toHaveClass('bg-grid-accent');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies focus-visible outline with accent color', () => {
    render(<Button>Focus test</Button>);
    const button = screen.getByRole('button', { name: /focus test/i });
    expect(button).toHaveClass('focus-visible:outline-2', 'focus-visible:outline-offset-2');
  });

  it('has correct transition duration', () => {
    render(<Button>Transition test</Button>);
    const button = screen.getByRole('button', { name: /transition test/i });
    expect(button).toHaveClass('transition-colors', 'duration-200');
  });
});