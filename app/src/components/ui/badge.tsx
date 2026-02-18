import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-grid-text-muted/10 text-grid-text-dim border-transparent',
        success: 'bg-grid-success/10 text-grid-success border-transparent',
        warning: 'bg-grid-warning/10 text-grid-warning border-transparent',
        error: 'bg-grid-error/10 text-grid-error border-transparent',
        info: 'bg-grid-info/10 text-grid-info border-transparent',
        outline: 'bg-transparent border border-current text-current',
      },
      size: {
        sm: 'text-[length:var(--font-size-xs)] px-1.5 py-0.5',
        md: 'text-[length:var(--font-size-sm)] px-2 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };