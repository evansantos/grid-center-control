import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent, CardFooter } from './card';

describe('Card', () => {
  it('renders with default variant', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-grid-surface', 'border-grid-border');
  });

  it('applies default variant classes correctly', () => {
    render(<Card variant="default" data-testid="card">Default card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-grid-surface', 'border-grid-border');
  });

  it('applies accent variant classes correctly', () => {
    render(<Card variant="accent" data-testid="card">Accent card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('border-grid-accent/30');
  });

  it('applies glass variant classes correctly', () => {
    render(<Card variant="glass" data-testid="card">Glass card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('backdrop-blur-sm', 'bg-grid-surface/80');
  });

  it('applies base card classes', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('rounded-lg', 'border');
  });

  it('applies hover transition classes', () => {
    render(<Card data-testid="card">Card content</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('transition', 'hover:border-grid-border-bright');
  });

  it('merges custom className correctly', () => {
    render(<Card className="custom-class" data-testid="card">Custom card</Card>);
    const card = screen.getByTestId('card');
    expect(card).toHaveClass('custom-class');
    // Should still have default classes
    expect(card).toHaveClass('bg-grid-surface', 'border-grid-border');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Card ref={ref} data-testid="card">Ref test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders CardHeader correctly', () => {
    render(<CardHeader data-testid="header">Header content</CardHeader>);
    const header = screen.getByTestId('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('px-4', 'pt-4', 'flex');
  });

  it('renders CardContent correctly', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('px-4', 'py-3');
  });

  it('renders CardFooter correctly', () => {
    render(<CardFooter data-testid="footer">Footer content</CardFooter>);
    const footer = screen.getByTestId('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('px-4', 'pb-4', 'flex', 'gap-2');
  });

  it('composes sub-components together', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">Title</CardHeader>
        <CardContent data-testid="content">Main content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    );
    
    const card = screen.getByTestId('card');
    const header = screen.getByTestId('header');
    const content = screen.getByTestId('content');
    const footer = screen.getByTestId('footer');
    
    expect(card).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    
    expect(card).toContainElement(header);
    expect(card).toContainElement(content);
    expect(card).toContainElement(footer);
  });

  it('CardHeader forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardHeader ref={ref} data-testid="header">Header</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('CardContent forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardContent ref={ref} data-testid="content">Content</CardContent>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('CardFooter forwards ref correctly', () => {
    const ref = { current: null };
    render(<CardFooter ref={ref} data-testid="footer">Footer</CardFooter>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('CardHeader merges custom className', () => {
    render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>);
    const header = screen.getByTestId('header');
    expect(header).toHaveClass('custom-header', 'px-4', 'pt-4');
  });

  it('CardContent merges custom className', () => {
    render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
    const content = screen.getByTestId('content');
    expect(content).toHaveClass('custom-content', 'px-4', 'py-3');
  });

  it('CardFooter merges custom className', () => {
    render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>);
    const footer = screen.getByTestId('footer');
    expect(footer).toHaveClass('custom-footer', 'px-4', 'pb-4');
  });
});