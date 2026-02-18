import { render } from '@testing-library/react';
import { createRef } from 'react';
import { Input } from './input';

describe('Input', () => {
  it('renders default input', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('bg-grid-surface', 'border-grid-border', 'text-grid-text');
  });

  it('renders search variant with icon', () => {
    const { container } = render(<Input variant="search" />);
    const wrapper = container.firstChild;
    const searchIcon = container.querySelector('svg');
    
    expect(wrapper).toHaveClass('relative');
    expect(searchIcon).toBeInTheDocument();
  });

  it('applies sm size classes', () => {
    const { container } = render(<Input size="sm" />);
    const input = container.querySelector('input');
    
    expect(input).toHaveClass('text-xs', 'h-7');
  });

  it('applies md size classes', () => {
    const { container } = render(<Input size="md" />);
    const input = container.querySelector('input');
    
    expect(input).toHaveClass('text-xs', 'h-8');
  });

  it('applies lg size classes', () => {
    const { container } = render(<Input size="lg" />);
    const input = container.querySelector('input');
    
    expect(input).toHaveClass('text-sm', 'h-9');
  });

  it('shows error state with message and red border', () => {
    const { container, getByText } = render(
      <Input error="This field is required" />
    );
    const input = container.querySelector('input');
    const errorMessage = getByText('This field is required');
    
    expect(input).toHaveClass('border-grid-error');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-grid-error');
  });

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('merges custom className', () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector('input');
    
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveClass('bg-grid-surface'); // Original classes should still be there
  });

  it('supports placeholder', () => {
    const { container } = render(<Input placeholder="Enter text..." />);
    const input = container.querySelector('input');
    
    expect(input).toHaveAttribute('placeholder', 'Enter text...');
    expect(input).toHaveClass('placeholder:text-grid-text-muted');
  });

  it('applies focus styles', () => {
    const { container } = render(<Input />);
    const input = container.querySelector('input');
    
    expect(input).toHaveClass('focus:border-grid-accent', 'focus:ring-1', 'focus:ring-grid-accent/30');
  });
});