import * as React from 'react';
import { cn } from '@/lib/utils';

// Table Root Component
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={cn('w-full border-collapse text-xs', className)}
        {...props}
      />
    );
  }
);
Table.displayName = 'Table';

// TableHeader Component
export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('border-b border-grid-border', className)}
        {...props}
      />
    );
  }
);
TableHeader.displayName = 'TableHeader';

// TableBody Component
export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('divide-y divide-grid-border', className)}
        {...props}
      />
    );
  }
);
TableBody.displayName = 'TableBody';

// TableRow Component
export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn('hover:bg-grid-surface-hover transition-colors', className)}
        {...props}
      />
    );
  }
);
TableRow.displayName = 'TableRow';

// TableHead Component with optional sort indicator
export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc';
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable, sortDirection, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          'text-left text-[length:var(--font-size-xs)] text-grid-text-muted font-medium px-3 py-2',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-1">
          {children}
          {sortable && sortDirection && (
            <span className="text-grid-text-muted">
              {sortDirection === 'asc' ? '▲' : '▼'}
            </span>
          )}
        </div>
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

// TableCell Component
export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn('px-3 py-2 text-grid-text', className)}
        {...props}
      />
    );
  }
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };