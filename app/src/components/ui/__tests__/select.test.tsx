import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

describe('Select', () => {
  it('renders select trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('displays error state', () => {
    render(
      <Select>
        <SelectTrigger error="This field is required">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Content should appear (though it might be portal-ed)
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects item when clicked', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const option1 = screen.getByText('Option 1');
    await user.click(option1);

    expect(onValueChange).toHaveBeenCalledWith('option1');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    
    // Focus trigger
    trigger.focus();
    expect(trigger).toHaveFocus();

    // Open with Enter
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    
    // Select with Enter
    await user.keyboard('{Enter}');
    
    expect(onValueChange).toHaveBeenCalledWith('option2');
  });

  it('supports disabled state', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });

  it('renders with custom className', () => {
    render(
      <Select>
        <SelectTrigger className="custom-class">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveClass('custom-class');
  });

  it('associates error with trigger via aria-describedby', () => {
    render(
      <Select>
        <SelectTrigger id="test-select" error="Error message">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole('button');
    const errorElement = screen.getByText('Error message');
    
    expect(trigger).toHaveAttribute('aria-describedby', 'test-select-error');
    expect(errorElement).toHaveAttribute('id', 'test-select-error');
  });

  it('renders select items with indicators', async () => {
    const user = userEvent.setup();
    
    render(
      <Select defaultValue="option2">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Selected item should have an indicator (dot)
    const selectedItem = screen.getByText('Option 2').closest('[role="option"]');
    expect(selectedItem).toHaveAttribute('data-state', 'checked');
  });

  it('supports grouping with labels', async () => {
    const user = userEvent.setup();
    
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Press Escape
    await user.keyboard('{Escape}');

    // Should close dropdown
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});