import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  // Base styles with enhanced hover transitions and animations
  'rounded-lg border transition-all duration-normal ease-out',
  {
    variants: {
      variant: {
        default: 'bg-grid-surface border-grid-border hover:border-grid-border-bright hover:shadow-sm',
        accent: 'bg-grid-surface border-grid-accent/30 shadow-[0_0_0_1px_var(--grid-accent-dim)] hover:shadow-[0_0_0_1px_var(--grid-accent-glow)] hover:border-grid-accent/50',
        glass: 'backdrop-blur-sm bg-grid-surface/80 border-grid-border/50 hover:bg-grid-surface/90 hover:border-grid-border-bright/60',
      },
      interactive: {
        false: '',
        true: 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grid-accent',
      },
      animation: {
        none: '',
        lift: 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg',
        glow: 'hover:shadow-[0_0_0_1px_var(--grid-accent-dim)]',
        pulse: 'hover:animate-glow-pulse',
        subtle: 'hover:shadow-sm hover:border-grid-border-bright',
      },
    },
    defaultVariants: {
      variant: 'default',
      interactive: false,
      animation: 'subtle',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Make the card clickable with enhanced interactions */
  asButton?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, animation, asButton = false, onClick, children, ...props }, ref) => {
    // If used as a button, automatically make it interactive
    const isInteractive = interactive || asButton;
    
    if (asButton) {
      return (
        <button
          type="button"
          className={cn(
            cardVariants({ variant, interactive: isInteractive, animation }),
            'text-left', // Reset button text alignment
            className
          )}
          onClick={onClick as any}
          {...(props as any)}
        >
          {children}
        </button>
      );
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, interactive: isInteractive, animation }),
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-4 pt-4 flex items-center justify-between', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight text-grid-text',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-grid-text-dim', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-4 py-3', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold text-grid-text-primary', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-grid-text-secondary', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-4 pb-4 flex items-center gap-2', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };