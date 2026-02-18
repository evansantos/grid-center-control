import React from 'react';
import { render } from '@testing-library/react';
import { StatusDot } from './status-dot';

describe('StatusDot', () => {
  it('renders active status with correct color and pulse animation', () => {
    const { container } = render(<StatusDot status="active" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('bg-grid-success', 'rounded-full');
    expect(dot).toHaveClass('animate-pulse');
  });

  it('renders idle status with correct color', () => {
    const { container } = render(<StatusDot status="idle" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('bg-grid-warning');
    expect(dot).not.toHaveClass('animate-pulse');
  });

  it('renders error status with correct color and pulse animation', () => {
    const { container } = render(<StatusDot status="error" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('bg-grid-error', 'animate-pulse');
  });

  it('renders busy status with correct color', () => {
    const { container } = render(<StatusDot status="busy" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('bg-grid-info');
    expect(dot).not.toHaveClass('animate-pulse');
  });

  it('renders offline status with correct color', () => {
    const { container } = render(<StatusDot status="offline" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('bg-grid-text-muted');
    expect(dot).not.toHaveClass('animate-pulse');
  });

  it('applies small size correctly', () => {
    const { container } = render(<StatusDot status="active" size="sm" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('w-1.5', 'h-1.5');
  });

  it('applies medium size correctly (default)', () => {
    const { container } = render(<StatusDot status="active" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('w-2.5', 'h-2.5');
  });

  it('applies large size correctly', () => {
    const { container } = render(<StatusDot status="active" size="lg" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('w-3.5', 'h-3.5');
  });

  it('merges custom className', () => {
    const { container } = render(
      <StatusDot status="active" className="custom-class" />
    );
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveClass('custom-class');
    expect(dot).toHaveClass('bg-grid-success', 'rounded-full');
  });

  it('renders as a span element', () => {
    const { container } = render(<StatusDot status="active" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot.tagName).toBe('SPAN');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<StatusDot status="active" ref={ref} />);
    
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('has role="status" for accessibility', () => {
    const { container } = render(<StatusDot status="active" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveAttribute('role', 'status');
  });

  it('has default aria-label based on status', () => {
    const { container: activeContainer } = render(<StatusDot status="active" />);
    const { container: idleContainer } = render(<StatusDot status="idle" />);
    const { container: errorContainer } = render(<StatusDot status="error" />);
    const { container: busyContainer } = render(<StatusDot status="busy" />);
    const { container: offlineContainer } = render(<StatusDot status="offline" />);

    expect(activeContainer.firstChild).toHaveAttribute('aria-label', 'Active');
    expect(idleContainer.firstChild).toHaveAttribute('aria-label', 'Idle');
    expect(errorContainer.firstChild).toHaveAttribute('aria-label', 'Error');
    expect(busyContainer.firstChild).toHaveAttribute('aria-label', 'Busy');
    expect(offlineContainer.firstChild).toHaveAttribute('aria-label', 'Offline');
  });

  it('accepts custom aria-label', () => {
    const { container } = render(<StatusDot status="active" aria-label="Connection Status: Online" />);
    const dot = container.firstChild as HTMLElement;
    
    expect(dot).toHaveAttribute('aria-label', 'Connection Status: Online');
  });
});