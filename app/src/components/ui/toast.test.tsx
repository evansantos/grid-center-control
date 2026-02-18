import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Toast, ToastProvider, ToastTitle, ToastDescription, ToastAction, ToastClose, ToastViewport } from './toast';

describe('Toast', () => {
  const ToastWrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );

  it('renders with title and description', () => {
    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={() => {}}>
          <ToastTitle>Test Title</ToastTitle>
          <ToastDescription>Test Description</ToastDescription>
        </Toast>
      </ToastWrapper>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('applies default variant classes', () => {
    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={() => {}} data-testid="toast">
          <ToastTitle>Title</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('bg-grid-surface', 'border-grid-border');
  });

  it('applies success variant classes', () => {
    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={() => {}} variant="success" data-testid="toast">
          <ToastTitle>Success</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('border-grid-success/30');
  });

  it('applies error variant classes', () => {
    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={() => {}} variant="error" data-testid="toast">
          <ToastTitle>Error</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('border-grid-error/30');
  });

  it('renders close button and handles click', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={onOpenChange}>
          <ToastTitle>Title</ToastTitle>
          <ToastClose />
        </Toast>
      </ToastWrapper>
    );

    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveClass('text-grid-text-muted');

    await user.click(closeButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders action button', () => {
    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={() => {}}>
          <ToastTitle>Title</ToastTitle>
          <ToastAction altText="Undo action">
            Undo
          </ToastAction>
        </Toast>
      </ToastWrapper>
    );

    const actionButton = screen.getByRole('button', { name: /undo/i });
    expect(actionButton).toBeInTheDocument();
  });

  it('auto-dismisses after duration', async () => {
    const onOpenChange = vi.fn();

    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={onOpenChange} duration={100}>
          <ToastTitle>Auto dismiss</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }, { timeout: 200 });
  });

  it('applies base styling classes', () => {
    render(
      <ToastWrapper>
        <Toast open={true} onOpenChange={() => {}} data-testid="toast">
          <ToastTitle>Title</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('rounded-lg', 'shadow-lg', 'p-4');
  });

  it('merges custom className', () => {
    render(
      <ToastWrapper>
        <Toast 
          open={true} 
          onOpenChange={() => {}} 
          className="custom-class" 
          data-testid="toast"
        >
          <ToastTitle>Title</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('custom-class');
    expect(toast).toHaveClass('bg-grid-surface'); // Still has default classes
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <ToastWrapper>
        <Toast ref={ref} open={true} onOpenChange={() => {}}>
          <ToastTitle>Ref Test</ToastTitle>
        </Toast>
      </ToastWrapper>
    );
    
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe('ToastViewport', () => {
  it('applies correct positioning classes', () => {
    render(
      <ToastProvider>
        <ToastViewport data-testid="viewport" />
      </ToastProvider>
    );
    
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveClass('fixed', 'z-50');
  });
});