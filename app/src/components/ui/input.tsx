import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  // Base styles for all inputs
  'w-full rounded-md border bg-grid-surface border-grid-border text-grid-text placeholder:text-grid-text-muted transition-colors duration-200 focus:outline-none focus:border-grid-accent focus:ring-1 focus:ring-grid-accent/30 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: '',
        search: 'pl-8', // Add left padding for search icon
      },
      size: {
        sm: 'text-xs h-7 px-2',
        md: 'text-xs h-8 px-3',
        lg: 'text-sm h-9 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    const inputClasses = cn(
      inputVariants({ variant, size }),
      error && 'border-grid-error',
      className
    );

    if (variant === 'search') {
      return (
        <div className="relative">
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-grid-text-muted">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            ref={ref}
            className={inputClasses}
            {...props}
          />
          {error && (
            <div className="mt-1 text-xs text-grid-error">
              {error}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && (
          <div className="mt-1 text-xs text-grid-error">
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };