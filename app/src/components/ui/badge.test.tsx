import { render } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    const { getByText } = render(<Badge>Default</Badge>);
    const badge = getByText('Default');
    
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-grid-text-muted/10', 'rounded-full');
  });

  it('renders success variant', () => {
    const { getByText } = render(<Badge variant="success">Success</Badge>);
    const badge = getByText('Success');
    
    expect(badge).toHaveClass('bg-grid-success/10');
  });

  it('renders warning variant', () => {
    const { getByText } = render(<Badge variant="warning">Warning</Badge>);
    const badge = getByText('Warning');
    
    expect(badge).toHaveClass('bg-grid-warning/10');
  });

  it('renders error variant', () => {
    const { getByText } = render(<Badge variant="error">Error</Badge>);
    const badge = getByText('Error');
    
    expect(badge).toHaveClass('bg-grid-error/10');
  });

  it('renders info variant', () => {
    const { getByText } = render(<Badge variant="info">Info</Badge>);
    const badge = getByText('Info');
    
    expect(badge).toHaveClass('bg-grid-info/10');
  });

  it('renders outline variant', () => {
    const { getByText } = render(<Badge variant="outline">Outline</Badge>);
    const badge = getByText('Outline');
    
    expect(badge).toHaveClass('border', 'bg-transparent');
  });

  it('renders small size', () => {
    const { getByText } = render(<Badge size="sm">Small</Badge>);
    const badge = getByText('Small');
    
    expect(badge).toHaveClass('text-[length:var(--font-size-xs)]', 'px-1.5', 'py-0.5');
  });

  it('renders medium size', () => {
    const { getByText } = render(<Badge size="md">Medium</Badge>);
    const badge = getByText('Medium');
    
    expect(badge).toHaveClass('text-[length:var(--font-size-sm)]', 'px-2', 'py-0.5');
  });

  it('merges custom className', () => {
    const { getByText } = render(<Badge className="custom-class">Custom</Badge>);
    const badge = getByText('Custom');
    
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveClass('bg-grid-text-muted/10'); // Still has default classes
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Badge ref={ref}>Ref Test</Badge>);
    
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});