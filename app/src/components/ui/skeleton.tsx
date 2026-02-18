import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const skeletonVariants = cva(
  'bg-grid-surface-hover animate-pulse',
  {
    variants: {
      variant: {
        text: 'h-4 w-full rounded',
        circle: 'rounded-full',
        card: 'h-32 w-full rounded-lg',
        'table-row': 'h-10 w-full rounded',
      },
    },
    defaultVariants: {
      variant: 'text',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  count?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, count = 1, ...props }, ref) => {
    if (count > 1) {
      return (
        <>
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={cn(skeletonVariants({ variant }), className)}
              ref={index === 0 ? ref : undefined}
              {...props}
            />
          ))}
        </>
      );
    }

    return (
      <div
        className={cn(skeletonVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton, skeletonVariants };