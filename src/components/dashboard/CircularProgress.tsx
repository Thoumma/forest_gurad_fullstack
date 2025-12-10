import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  variant?: 'primary' | 'warning' | 'danger' | 'success';
}

export const CircularProgress = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  showValue = true,
  className,
  variant = 'primary',
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const colorClasses = useMemo(() => {
    switch (variant) {
      case 'danger':
        return { stroke: 'stroke-fire-critical', text: 'text-fire-critical' };
      case 'warning':
        return { stroke: 'stroke-fire-moderate', text: 'text-fire-moderate' };
      case 'success':
        return { stroke: 'stroke-fire-low', text: 'text-fire-low' };
      default:
        return { stroke: 'stroke-primary', text: 'text-primary' };
    }
  }, [variant]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cn('transition-all duration-700 ease-out', colorClasses.stroke)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: percentage > 50 ? 'drop-shadow(0 0 6px currentColor)' : undefined,
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className={cn('font-mono font-bold text-2xl', colorClasses.text)}>
            {percentage.toFixed(0)}%
          </span>
          {label && (
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          )}
        </div>
      )}
    </div>
  );
};
