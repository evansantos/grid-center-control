import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { transitionPresets } from '@/lib/animations';

const buttonVariants = cva(
  // Base styles with enhanced animations and proper focus/disabled states
  'inline-flex items-center justify-center rounded-md font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--grid-accent)] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-all duration-normal ease-out relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-grid-accent text-white hover:bg-grid-accent/90 hover:brightness-110 active:scale-[0.98] active:brightness-90 focus-visible:ring-2 focus-visible:ring-grid-accent focus-visible:ring-offset-2',
        secondary: 'border border-grid-border bg-grid-surface text-grid-text hover:bg-grid-surface-hover hover:border-grid-border-bright hover:shadow-[0_0_0_1px_var(--grid-accent-dim)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-grid-accent focus-visible:ring-offset-2',
        ghost: 'bg-transparent text-grid-text hover:bg-grid-surface hover:text-grid-text active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grid-accent',
        danger: 'bg-grid-error text-white hover:bg-grid-error/90 hover:brightness-110 active:scale-[0.98] active:brightness-90 focus-visible:ring-2 focus-visible:ring-grid-error focus-visible:ring-offset-2',
      },
      size: {
        sm: 'text-xs px-3 py-2.5 min-h-[44px]', // Ensures 44px minimum touch target
        md: 'text-sm px-4 py-3 min-h-[44px]',   // Ensures 44px minimum touch target
        lg: 'text-base px-6 py-3.5 min-h-[48px]', // Larger for better desktop experience
      },
      animation: {
        none: '',
        subtle: 'hover:scale-[1.02] hover:-translate-y-0.5',
        bounce: 'hover:animate-bounce-subtle',
        glow: 'hover:shadow-[0_0_12px_var(--grid-accent-glow)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      animation: 'none',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Enable ripple effect on click */
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, ripple = false, onClick, children, ...props }, ref) => {
    const [rippleElements, setRippleElements] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Call the original onClick handler
      onClick?.(e);
      
      // Add ripple effect if enabled
      if (ripple && !props.disabled) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        const newRipple = { id: Date.now(), x, y };
        setRippleElements(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRippleElements(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);
      }
    };
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, animation }), className)}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
        {ripple && rippleElements.map(rippleElement => (
          <span
            key={rippleElement.id}
            className="absolute bg-white/20 rounded-full animate-ripple pointer-events-none"
            style={{
              left: rippleElement.x,
              top: rippleElement.y,
              width: 10,
              height: 10,
            }}
          />
        ))}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };