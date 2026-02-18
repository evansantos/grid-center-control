import { render } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('renders with default (text) variant', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild;
    
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('h-4', 'w-full', 'rounded', 'bg-grid-surface-hover', 'animate-pulse');
  });

  it('renders circle variant with correct classes', () => {
    const { container } = render(<Skeleton variant="circle" />);
    const skeleton = container.firstChild;
    
    expect(skeleton).toHaveClass('rounded-full', 'bg-grid-surface-hover', 'animate-pulse');
  });

  it('renders card variant with correct classes', () => {
    const { container } = render(<Skeleton variant="card" />);
    const skeleton = container.firstChild;
    
    expect(skeleton).toHaveClass('h-32', 'w-full', 'rounded-lg', 'bg-grid-surface-hover', 'animate-pulse');
  });

  it('renders table-row variant with correct classes', () => {
    const { container } = render(<Skeleton variant="table-row" />);
    const skeleton = container.firstChild;
    
    expect(skeleton).toHaveClass('h-10', 'w-full', 'rounded', 'bg-grid-surface-hover', 'animate-pulse');
  });

  it('merges custom className with variant classes', () => {
    const { container } = render(<Skeleton variant="text" className="custom-class" />);
    const skeleton = container.firstChild;
    
    expect(skeleton).toHaveClass('custom-class');
    expect(skeleton).toHaveClass('h-4', 'w-full', 'rounded'); // Still has variant classes
  });

  it('renders multiple skeletons when count prop is provided', () => {
    const { container } = render(<Skeleton count={3} />);
    const skeletons = container.children;
    
    expect(skeletons).toHaveLength(3);
    Array.from(skeletons).forEach(skeleton => {
      expect(skeleton).toHaveClass('h-4', 'w-full', 'rounded', 'bg-grid-surface-hover', 'animate-pulse');
    });
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Skeleton ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});