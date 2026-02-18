import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './card';

const statCardVariants = cva(
  'transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-grid-border',
        success: 'border-grid-success/30 bg-grid-success/5',
        warning: 'border-grid-warning/30 bg-grid-warning/5',
        error: 'border-grid-error/30 bg-grid-error/5',
        info: 'border-grid-info/30 bg-grid-info/5',
      },
      trend: {
        up: 'ring-1 ring-green-500/20',
        down: 'ring-1 ring-red-500/20',
        neutral: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      trend: 'neutral',
    },
  }
);

const statValueVariants = cva(
  'text-2xl font-bold font-mono',
  {
    variants: {
      variant: {
        default: 'text-grid-text',
        success: 'text-grid-success',
        warning: 'text-grid-warning',
        error: 'text-grid-error',
        info: 'text-grid-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  icon?: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    className, 
    variant, 
    trend, 
    icon, 
    label, 
    value, 
    change, 
    changeType = 'neutral',
    ...props 
  }, ref) => {
    // Auto-determine trend from changeType if not explicitly set
    const computedTrend = trend || (
      changeType === 'increase' ? 'up' : 
      changeType === 'decrease' ? 'down' : 
      'neutral'
    );

    return (
      <Card
        ref={ref}
        className={cn(statCardVariants({ variant, trend: computedTrend }), className)}
        {...props}
      >
        <CardContent className="p-4">
          {/* Label with optional icon */}
          <div className="flex items-center gap-2 text-xs text-grid-text-muted mb-2">
            {icon && <span>{icon}</span>}
            <span>{label}</span>
          </div>

          {/* Main value */}
          <div className={cn(statValueVariants({ variant }))}>
            {value}
          </div>

          {/* Optional change indicator */}
          {change && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  'text-xs',
                  changeType === 'increase' && 'text-green-400',
                  changeType === 'decrease' && 'text-red-400',
                  changeType === 'neutral' && 'text-grid-text-muted'
                )}
              >
                {changeType === 'increase' && '↗'}
                {changeType === 'decrease' && '↘'}
                {changeType === 'neutral' && '→'}
                {change}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard, statCardVariants, statValueVariants };