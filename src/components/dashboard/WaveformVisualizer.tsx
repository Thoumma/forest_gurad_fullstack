import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface WaveformVisualizerProps {
  rms: number;
  peak: number;
  className?: string;
  barCount?: number;
}

export const WaveformVisualizer = ({
  rms,
  peak,
  className,
  barCount = 24,
}: WaveformVisualizerProps) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate dynamic bar heights based on RMS and peak
    const newBars = Array.from({ length: barCount }, (_, i) => {
      const position = i / barCount;
      const baseHeight = rms * 100;
      const peakInfluence = peak * 100 * Math.sin(position * Math.PI);
      const noise = Math.random() * 20;
      return Math.min(100, Math.max(5, baseHeight + peakInfluence * 0.5 + noise));
    });
    setBars(newBars);
  }, [rms, peak, barCount]);

  return (
    <div className={cn('flex items-end justify-center gap-0.5 h-16', className)}>
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-primary/60 to-primary transition-all duration-150"
          style={{
            height: `${height}%`,
            opacity: 0.4 + (height / 100) * 0.6,
          }}
        />
      ))}
    </div>
  );
};
