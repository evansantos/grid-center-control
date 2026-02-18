import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  // Base styles for all inputs with enhanced animations
  'w-full rounded-md border bg-grid-surface border-grid-border text-grid-text placeholder:text-grid-text-muted transition-all duration-normal ease-out focus:outline-none focus:border-grid-accent focus:ring-2 focus:ring-grid-accent/20 focus:shadow-[0_0_0_1px_var(--grid-accent-glow)] hover:border-grid-border-bright disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: '',
        search: 'pl-8', // Add left padding for search icon
        floating: 'pt-6 pb-2', // Space for floating label
      },
      size: {
        sm: 'text-sm h-11 px-3', // Meets 44px minimum touch target
        md: 'text-sm h-12 px-4', // Comfortable default mobile size
        lg: 'text-base h-14 px-4', // Larger for better desktop experience
      },
      state: {
        default: '',
        error: 'border-grid-error focus:border-grid-error focus:ring-grid-error/20 focus:shadow-[0_0_0_1px_rgba(239,68,68,0.3)]',
        success: 'border-grid-success focus:border-grid-success focus:ring-grid-success/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, state, error, success, icon, loading, ...props }, ref) => {
    // Determine the state based on props
    const inputState = error ? 'error' : success ? 'success' : state || 'default';
    
    const inputClasses = cn(
      inputVariants({ variant, size, state: inputState }),
      className
    );

    const hasIcon = variant === 'search' || icon || loading;
    const iconPadding = hasIcon ? (size === 'sm' ? 'pl-8' : size === 'lg' ? 'pl-10' : 'pl-9') : '';
    
    return (
      <div className="relative">
        {hasIcon && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 text-grid-text-muted transition-colors duration-normal",
            size === 'sm' ? 'left-2.5' : 'left-3'
          )}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : variant === 'search' ? (
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
            ) : (
              icon
            )}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(inputClasses, hasIcon && iconPadding)}
          {...props}
        />
        
        {/* Success/Error icons */}
        {(success || error) && !loading && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-colors duration-normal",
            size === 'sm' ? 'right-2.5' : 'right-3'
          )}>
            {success && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-grid-success animate-scale-in"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
            {error && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-grid-error animate-scale-in"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            )}
          </div>
        )}
        
        {/* Error message with animation */}
        {error && (
          <div className="mt-1 text-xs text-grid-error animate-slide-down">
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };