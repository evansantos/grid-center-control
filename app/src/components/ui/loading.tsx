/**
 * Loading Components - Various animated loading states
 * 
 * Provides different loading animations that respect accessibility preferences
 */
import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Spinner Variants
const spinnerVariants = cva(
  'inline-block border-2 border-current border-t-transparent rounded-full animate-spin',
  {
    variants: {
      size: {
        sm: 'w-4 h-4 border-[1.5px]',
        md: 'w-5 h-5',
        lg: 'w-6 h-6 border-[2.5px]',
        xl: 'w-8 h-8 border-[3px]',
      },
      variant: {
        default: 'border-grid-text border-t-transparent',
        accent: 'border-grid-accent border-t-transparent',
        muted: 'border-grid-text-muted border-t-transparent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

// Dots Loading Animation
const dotsVariants = cva(
  'flex items-center gap-1',
  {
    variants: {
      size: {
        sm: 'gap-0.5',
        md: 'gap-1',
        lg: 'gap-1.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface DotsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotsVariants> {
  variant?: 'default' | 'accent' | 'muted';
}

const Dots = React.forwardRef<HTMLDivElement, DotsProps>(
  ({ className, size, variant = 'default', ...props }, ref) => {
    const dotSizeClass = {
      sm: 'w-1 h-1',
      md: 'w-1.5 h-1.5',
      lg: 'w-2 h-2',
    }[size || 'md'];

    const dotColorClass = {
      default: 'bg-grid-text',
      accent: 'bg-grid-accent',
      muted: 'bg-grid-text-muted',
    }[variant];

    return (
      <div
        ref={ref}
        className={cn(dotsVariants({ size }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              'rounded-full animate-loading-dots',
              dotSizeClass,
              dotColorClass
            )}
            style={{
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}
      </div>
    );
  }
);
Dots.displayName = 'Dots';

// Pulse Animation
const pulseVariants = cva(
  'animate-pulse',
  {
    variants: {
      variant: {
        circle: 'rounded-full bg-grid-surface-hover',
        rectangle: 'rounded bg-grid-surface-hover',
        text: 'rounded bg-grid-surface-hover h-4',
      },
      size: {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        full: 'w-full h-full',
      },
    },
    defaultVariants: {
      variant: 'rectangle',
      size: 'md',
    },
  }
);

export interface PulseProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pulseVariants> {}

const Pulse = React.forwardRef<HTMLDivElement, PulseProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pulseVariants({ variant, size }), className)}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }
);
Pulse.displayName = 'Pulse';

// Progress Bar
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0, 
    max = 100, 
    variant = 'default', 
    size = 'md', 
    animated = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const heightClass = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    }[size];
    
    const colorClass = {
      default: 'bg-grid-accent',
      accent: 'bg-grid-accent',
      success: 'bg-grid-success',
      warning: 'bg-grid-warning',
      error: 'bg-grid-error',
    }[variant];
    
    return (
      <div
        ref={ref}
        className={cn(
          'w-full bg-grid-surface-hover rounded-full overflow-hidden',
          heightClass,
          className
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-slow ease-out',
            colorClass,
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

// Loading Container - Combines different loading states
export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'accent' | 'muted';
  text?: string;
  centered?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    className, 
    type = 'spinner', 
    size = 'md', 
    variant = 'default',
    text,
    centered = false,
    children,
    ...props 
  }, ref) => {
    const renderLoadingIndicator = () => {
      // Map xl size to lg for components that don't support xl
      const mappedSize = size === 'xl' ? 'lg' : size;
      
      switch (type) {
        case 'spinner':
          return <Spinner size={size} variant={variant} />;
        case 'dots':
          return <Dots size={mappedSize} variant={variant} />;
        case 'pulse':
          return <Pulse size={mappedSize} variant={variant === 'default' ? 'circle' : 'circle'} />;
        default:
          return <Spinner size={size} variant={variant} />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3',
          centered && 'justify-center min-h-[120px]',
          className
        )}
        {...props}
      >
        {renderLoadingIndicator()}
        {text && (
          <span className="text-grid-text-muted text-sm animate-pulse">
            {text}
          </span>
        )}
        {children}
      </div>
    );
  }
);
Loading.displayName = 'Loading';

// Loading overlay for full-screen loading states
export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  type?: LoadingProps['type'];
  text?: string;
  backdrop?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ 
    className, 
    show, 
    type = 'spinner', 
    text = 'Loading...', 
    backdrop = true,
    ...props 
  }, ref) => {
    if (!show) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-[9999] flex items-center justify-center',
          backdrop && 'bg-grid-bg/80 backdrop-blur-sm',
          'animate-in fade-in duration-normal',
          className
        )}
        {...props}
      >
        <div className="bg-grid-surface border border-grid-border rounded-lg p-6 shadow-xl">
          <Loading type={type} text={text} centered />
        </div>
      </div>
    );
  }
);
LoadingOverlay.displayName = 'LoadingOverlay';

export { 
  Spinner, 
  Dots, 
  Pulse, 
  Progress, 
  Loading, 
  LoadingOverlay,
  spinnerVariants,
  dotsVariants,
  pulseVariants,
};