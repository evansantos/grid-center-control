import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  // Enhanced skeleton with shimmer effect that respects reduced motion
  'relative bg-grid-surface-hover rounded overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-grid-surface before:to-transparent before:animate-[shimmer_1.5s_ease-in-out_infinite]',
  {
    variants: {
      variant: {
        text: 'h-4 w-full',
        'text-sm': 'h-3 w-full',
        'text-lg': 'h-6 w-full',
        circle: 'rounded-full aspect-square',
        card: 'h-32 w-full rounded-lg',
        'table-row': 'h-10 w-full',
        avatar: 'h-10 w-10 rounded-full',
        'avatar-sm': 'h-8 w-8 rounded-full',
        'avatar-lg': 'h-12 w-12 rounded-full',
        button: 'h-10 w-20 rounded-md',
        'button-sm': 'h-8 w-16 rounded-md',
        'button-lg': 'h-12 w-24 rounded-md',
        image: 'aspect-video w-full rounded-lg',
        badge: 'h-5 w-16 rounded-full',
      },
      animation: {
        shimmer: '',
        pulse: 'before:hidden animate-pulse',
        wave: 'before:animate-[shimmer_2s_ease-in-out_infinite]',
        none: 'before:hidden',
      },
    },
    defaultVariants: {
      variant: 'text',
      animation: 'shimmer',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Number of skeleton items to render */
  count?: number;
  /** Custom width (takes precedence over variant width) */
  width?: string | number;
  /** Custom height (takes precedence over variant height) */
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animation, count = 1, width, height, style, ...props }, ref) => {
    const customStyle = {
      ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
      ...style,
    };

    if (count > 1) {
      return (
        <>
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={cn(skeletonVariants({ variant, animation }), className)}
              style={customStyle}
              ref={index === 0 ? ref : undefined}
              {...props}
            />
          ))}
        </>
      );
    }

    return (
      <div
        className={cn(skeletonVariants({ variant, animation }), className)}
        style={customStyle}
        ref={ref}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants };