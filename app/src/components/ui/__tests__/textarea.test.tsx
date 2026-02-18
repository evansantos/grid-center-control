import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea';

describe('Textarea', () => {
  it('renders textarea with placeholder', () => {
    render(<Textarea placeholder="Enter your message..." />);
    
    const textarea = screen.getByPlaceholderText('Enter your message...');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Textarea size="sm" data-testid="textarea-sm" />);
    expect(screen.getByTestId('textarea-sm')).toHaveClass('text-xs', 'p-2', 'min-h-[80px]');

    rerender(<Textarea size="md" data-testid="textarea-md" />);
    expect(screen.getByTestId('textarea-md')).toHaveClass('text-xs', 'p-3', 'min-h-[100px]');

    rerender(<Textarea size="lg" data-testid="textarea-lg" />);
    expect(screen.getByTestId('textarea-lg')).toHaveClass('text-sm', 'p-4', 'min-h-[120px]');
  });

  it('displays error state', () => {
    render(<Textarea error="This field is required" id="test-textarea" />);
    
    const textarea = screen.getByRole('textbox');
    const errorMessage = screen.getByText('This field is required');
    
    expect(textarea).toHaveClass('border-grid-error');
    expect(errorMessage).toBeInTheDocument();
    expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-error');
    expect(errorMessage).toHaveAttribute('id', 'test-textarea-error');
  });

  it('handles value changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    
    render(<Textarea onChange={onChange} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello world');
    
    expect(onChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello world');
  });

  it('supports controlled component pattern', () => {
    const { rerender } = render(<Textarea value="Initial value" readOnly />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Initial value');
    
    rerender(<Textarea value="Updated value" readOnly />);
    expect(textarea.value).toBe('Updated value');
  });

  it('supports disabled state', () => {
    render(<Textarea disabled />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
  });

  it('forwards ref correctly', () => {
    const ref = jest.fn();
    render(<Textarea ref={ref} />);
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });

  it('applies custom className', () => {
    render(<Textarea className="custom-class" data-testid="custom-textarea" />);
    
    const textarea = screen.getByTestId('custom-textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('supports resize behavior', () => {
    render(<Textarea data-testid="resizable-textarea" />);
    
    const textarea = screen.getByTestId('resizable-textarea');
    expect(textarea).toHaveClass('resize-y');
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    
    render(<Textarea onFocus={onFocus} onBlur={onBlur} />);
    
    const textarea = screen.getByRole('textbox');
    
    await user.click(textarea);
    expect(onFocus).toHaveBeenCalled();
    
    await user.tab(); // Move focus away
    expect(onBlur).toHaveBeenCalled();
  });

  it('supports rows attribute', () => {
    render(<Textarea rows={5} data-testid="rows-textarea" />);
    
    const textarea = screen.getByTestId('rows-textarea');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('supports maxLength attribute', () => {
    render(<Textarea maxLength={100} data-testid="maxlength-textarea" />);
    
    const textarea = screen.getByTestId('maxlength-textarea');
    expect(textarea).toHaveAttribute('maxLength', '100');
  });

  it('supports required attribute', () => {
    render(<Textarea required data-testid="required-textarea" />);
    
    const textarea = screen.getByTestId('required-textarea');
    expect(textarea).toHaveAttribute('required');
  });

  it('supports readonly attribute', async () => {
    const user = userEvent.setup();
    render(<Textarea readOnly value="Read only text" />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('readOnly');
    
    // Try to type - should not change value
    await user.type(textarea, 'new text');
    expect(textarea).toHaveValue('Read only text');
  });

  it('handles keyboard events correctly', async () => {
    const user = userEvent.setup();
    const onKeyDown = jest.fn();
    
    render(<Textarea onKeyDown={onKeyDown} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'test{Enter}newline');
    
    expect(onKeyDown).toHaveBeenCalled();
    expect(textarea).toHaveValue('test\nnewline');
  });

  it('displays error without id gracefully', () => {
    render(<Textarea error="Error without id" />);
    
    const errorMessage = screen.getByText('Error without id');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('id', 'undefined-error');
  });

  it('combines error state with custom className', () => {
    render(<Textarea error="Error message" className="custom-error" data-testid="error-textarea" />);
    
    const textarea = screen.getByTestId('error-textarea');
    expect(textarea).toHaveClass('border-grid-error', 'custom-error');
  });

  it('maintains focus state styling', async () => {
    const user = userEvent.setup();
    render(<Textarea data-testid="focus-textarea" />);
    
    const textarea = screen.getByTestId('focus-textarea');
    expect(textarea).toHaveClass('focus:border-grid-accent', 'focus:ring-1', 'focus:ring-grid-accent/30');
    
    await user.click(textarea);
    expect(textarea).toHaveFocus();
  });

  it('supports default size when no size provided', () => {
    render(<Textarea data-testid="default-textarea" />);
    
    const textarea = screen.getByTestId('default-textarea');
    expect(textarea).toHaveClass('text-xs', 'p-3', 'min-h-[100px]'); // md size defaults
  });

  it('handles form validation correctly', () => {
    render(
      <form>
        <Textarea required name="message" data-testid="form-textarea" />
      </form>
    );
    
    const textarea = screen.getByTestId('form-textarea');
    expect(textarea).toHaveAttribute('name', 'message');
    expect(textarea).toBeRequired();
  });

  it('supports autoComplete attribute', () => {
    render(<Textarea autoComplete="on" data-testid="autocomplete-textarea" />);
    
    const textarea = screen.getByTestId('autocomplete-textarea');
    expect(textarea).toHaveAttribute('autoComplete', 'on');
  });
});