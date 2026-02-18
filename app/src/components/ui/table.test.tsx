import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './table';

describe('Table Components', () => {
  it('renders table with headers and rows correctly', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane Smith</TableCell>
            <TableCell>Inactive</TableCell>
            <TableCell>Delete</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    // Check that table structure renders correctly
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('w-full', 'border-collapse', 'text-xs');

    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check rows
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('applies correct classes to sub-components', () => {
    render(
      <Table>
        <TableHeader data-testid="table-header">
          <TableRow data-testid="header-row">
            <TableHead data-testid="table-head">Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="table-body">
          <TableRow data-testid="body-row">
            <TableCell data-testid="table-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    // TableHeader classes
    const header = screen.getByTestId('table-header');
    expect(header).toHaveClass('border-b', 'border-grid-border');

    // TableHead classes
    const head = screen.getByTestId('table-head');
    expect(head).toHaveClass(
      'text-left',
      'text-grid-text-muted',
      'font-medium',
      'px-3',
      'py-2'
    );
    expect(head.className).toContain('text-[length:var(--font-size-xs)]');

    // TableBody classes
    const body = screen.getByTestId('table-body');
    expect(body).toHaveClass('divide-y', 'divide-grid-border');

    // TableRow classes (in body)
    const bodyRow = screen.getByTestId('body-row');
    expect(bodyRow).toHaveClass(
      'hover:bg-grid-surface-hover',
      'transition-colors'
    );

    // TableCell classes
    const cell = screen.getByTestId('table-cell');
    expect(cell).toHaveClass('px-3', 'py-2', 'text-grid-text');
  });

  it('renders TableHead with sort indicator when sortable prop is passed', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sortDirection="asc">
              Name
            </TableHead>
            <TableHead sortable sortDirection="desc">
              Status
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );

    // Check for ascending sort indicator
    expect(screen.getByText('▲')).toBeInTheDocument();
    // Check for descending sort indicator
    expect(screen.getByText('▼')).toBeInTheDocument();
  });

  it('merges custom className on all sub-components', () => {
    render(
      <Table className="custom-table">
        <TableHeader className="custom-header">
          <TableRow className="custom-header-row">
            <TableHead className="custom-head">Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="custom-body">
          <TableRow className="custom-body-row">
            <TableCell className="custom-cell">Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = screen.getByRole('table');
    expect(table).toHaveClass('custom-table', 'w-full');

    // Check all custom classes are applied along with base classes
    const rowGroups = screen.getAllByRole('rowgroup');
    const header = rowGroups[0]; // thead is first rowgroup
    const body = rowGroups[1]; // tbody is second rowgroup
    
    expect(header).toHaveClass('custom-header');
    expect(body).toHaveClass('custom-body');
    expect(screen.getByRole('columnheader')).toHaveClass('custom-head');
    expect(screen.getByRole('cell')).toHaveClass('custom-cell');
  });

  it('renders empty table body gracefully', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody data-testid="empty-body">
          {/* No rows */}
        </TableBody>
      </Table>
    );

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const emptyBody = screen.getByTestId('empty-body');
    expect(emptyBody).toBeInTheDocument();
    expect(emptyBody).toHaveClass('divide-y', 'divide-grid-border');
  });

  it('forwards refs correctly on all sub-components', () => {
    const tableRef = { current: null };
    const headerRef = { current: null };
    const bodyRef = { current: null };
    const rowRef = { current: null };
    const headRef = { current: null };
    const cellRef = { current: null };

    render(
      <Table ref={tableRef}>
        <TableHeader ref={headerRef}>
          <TableRow ref={rowRef}>
            <TableHead ref={headRef}>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody ref={bodyRef}>
          <TableRow>
            <TableCell ref={cellRef}>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(tableRef.current).toBeInstanceOf(HTMLTableElement);
    expect(headerRef.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(bodyRef.current).toBeInstanceOf(HTMLTableSectionElement);
    expect(rowRef.current).toBeInstanceOf(HTMLTableRowElement);
    expect(headRef.current).toBeInstanceOf(HTMLTableCellElement);
    expect(cellRef.current).toBeInstanceOf(HTMLTableCellElement);
  });
});