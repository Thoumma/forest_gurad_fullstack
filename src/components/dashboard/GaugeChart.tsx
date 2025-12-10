import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  size?: 'sm' | 'md' | 'lg';
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
  showPercentage?: boolean;
}

export const GaugeChart = ({
  value,
  max,
  label,
  unit,
  size = 'md',
  thresholds = { low: 30, medium: 60, high: 80 },
  showPercentage = false,
}: GaugeChartProps) => {
  const dimensions = {
    sm: { size: 100, stroke: 8, fontSize: 'text-lg', labelSize: 'text-xs' },
    md: { size: 140, stroke: 10, fontSize: 'text-2xl', labelSize: 'text-sm' },
    lg: { size: 180, stroke: 12, fontSize: 'text-3xl', labelSize: 'text-base' },
  };

  const { size: svgSize, stroke, fontSize, labelSize } = dimensions[size];
  const radius = (svgSize - stroke) / 2;
  const circumference = radius * Math.PI; // Half circle
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const color = useMemo(() => {
    if (percentage >= thresholds.high) return 'stroke-fire-critical';
    if (percentage >= thresholds.medium) return 'stroke-fire-high';
    if (percentage >= thresholds.low) return 'stroke-fire-moderate';
    return 'stroke-fire-low';
  }, [percentage, thresholds]);

  const textColor = useMemo(() => {
    if (percentage >= thresholds.high) return 'text-fire-critical';
    if (percentage >= thresholds.medium) return 'text-fire-high';
    if (percentage >= thresholds.low) return 'text-fire-moderate';
    return 'text-fire-low';
  }, [percentage, thresholds]);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={svgSize}
        height={svgSize / 2 + 20}
        className="overflow-visible"
      >
        {/* Track */}
        <path
          d={`M ${stroke / 2} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - stroke / 2} ${svgSize / 2}`}
          fill="none"
          className="gauge-track"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <path
          d={`M ${stroke / 2} ${svgSize / 2} A ${radius} ${radius} 0 0 1 ${svgSize - stroke / 2} ${svgSize / 2}`}
          fill="none"
          className={cn('gauge-fill', color)}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: percentage >= thresholds.medium ? 'drop-shadow(0 0 8px currentColor)' : undefined,
          }}
        />
        {/* Center text */}
        <text
          x={svgSize / 2}
          y={svgSize / 2 - 5}
          textAnchor="middle"
          className={cn('font-mono font-bold fill-current', fontSize, textColor)}
        >
          {showPercentage ? `${percentage.toFixed(0)}%` : value.toFixed(1)}
        </text>
        <text
          x={svgSize / 2}
          y={svgSize / 2 + 15}
          textAnchor="middle"
          className="fill-muted-foreground text-xs font-mono"
        >
          {unit}
        </text>
      </svg>
      <span className={cn('mt-1 font-medium text-muted-foreground', labelSize)}>
        {label}
      </span>
    </div>
  );
};
