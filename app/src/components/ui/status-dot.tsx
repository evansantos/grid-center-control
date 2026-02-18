import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusDotVariants = cva(
  'rounded-full',
  {
    variants: {
      status: {
        active: 'bg-grid-success animate-pulse',
        idle: 'bg-grid-warning',
        error: 'bg-grid-error animate-pulse',
        busy: 'bg-grid-info',
        offline: 'bg-grid-text-muted',
      },
      size: {
        sm: 'w-1.5 h-1.5',
        md: 'w-2.5 h-2.5',
        lg: 'w-3.5 h-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  status: 'active' | 'idle' | 'error' | 'busy' | 'offline';
  'aria-label'?: string;
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status, size, 'aria-label': ariaLabel, ...props }, ref) => {
    const defaultAriaLabels = {
      active: 'Active',
      idle: 'Idle',
      error: 'Error',
      busy: 'Busy',
      offline: 'Offline',
    };

    return (
      <span
        className={cn(statusDotVariants({ status, size }), className)}
        role="status"
        aria-label={ariaLabel || defaultAriaLabels[status]}
        ref={ref}
        {...props}
      />
    );
  }
);

StatusDot.displayName = 'StatusDot';

export { StatusDot, statusDotVariants };