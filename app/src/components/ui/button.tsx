import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles with proper focus and disabled states
  'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--grid-accent)] disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-grid-accent text-white hover:bg-grid-accent/90',
        secondary: 'border border-grid-border bg-grid-surface text-grid-text hover:bg-grid-surface/80',
        ghost: 'bg-transparent text-grid-text hover:bg-grid-surface',
        danger: 'bg-grid-error text-white hover:bg-grid-error/90',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-xs px-3 py-1.5',
        lg: 'text-sm px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };