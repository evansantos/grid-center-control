import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'w-full rounded-md border bg-grid-surface border-grid-border text-grid-text placeholder:text-grid-text-muted transition-colors duration-200 focus:outline-none focus:border-grid-accent focus:ring-1 focus:ring-grid-accent/30 disabled:opacity-50 disabled:pointer-events-none resize-y',
  {
    variants: {
      size: {
        sm: 'text-xs p-2 min-h-[80px]',
        md: 'text-xs p-3 min-h-[100px]',
        lg: 'text-sm p-4 min-h-[120px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, error, ...props }, ref) => {
    const textareaClasses = cn(
      textareaVariants({ size }),
      error && 'border-grid-error',
      className
    );

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={textareaClasses}
          {...props}
        />
        {error && (
          <div className="mt-1 text-xs text-grid-error" id={`${props.id}-error`}>
            {error}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };