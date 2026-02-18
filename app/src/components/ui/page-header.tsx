import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pageHeaderVariants = cva(
  'flex flex-col gap-1 mb-6',
  {
    variants: {
      size: {
        sm: 'mb-4',
        md: 'mb-6',
        lg: 'mb-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const pageTitleVariants = cva(
  'font-bold text-grid-text',
  {
    variants: {
      size: {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, size, title, description, icon, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pageHeaderVariants({ size }), className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && (
              <span className="text-lg" role="img" aria-hidden="true">
                {icon}
              </span>
            )}
            <h1 className={cn(pageTitleVariants({ size }))}>
              {title}
            </h1>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        {description && (
          <p className="text-sm text-grid-text-muted">
            {description}
          </p>
        )}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export { PageHeader, pageHeaderVariants, pageTitleVariants };