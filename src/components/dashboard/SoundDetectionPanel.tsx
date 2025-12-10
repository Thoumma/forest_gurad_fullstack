import { SensorData } from '@/types/sensor';
import { WaveformVisualizer } from './WaveformVisualizer';
import { CircularProgress } from './CircularProgress';
import { cn } from '@/lib/utils';
import { Volume2, AlertTriangle, Activity } from 'lucide-react';

interface SoundDetectionPanelProps {
  data: SensorData | null;
}

export const SoundDetectionPanel = ({ data }: SoundDetectionPanelProps) => {
  if (!data) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 card-glow animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-6" />
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  const chainsawConfidence = data.chainsawProbability * 100;
  const variant = data.chainsawDetected ? 'danger' : chainsawConfidence > 30 ? 'warning' : 'success';
  const glowClass = data.chainsawDetected ? 'card-glow-danger' : 'card-glow';

  return (
    <div className={cn('bg-card rounded-xl border border-border p-6 transition-all duration-300', glowClass)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            data.chainsawDetected ? 'bg-destructive/20' : 'bg-primary/20'
          )}>
            <Volume2 className={cn(
              'w-5 h-5',
              data.chainsawDetected ? 'text-destructive' : 'text-primary'
            )} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sound Detection</h2>
            <p className="text-sm text-muted-foreground">Audio pattern analysis</p>
          </div>
        </div>

        {/* Detection Status */}
        <div className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2',
          data.chainsawDetected ? 'bg-destructive/20 text-destructive' :
          chainsawConfidence > 30 ? 'bg-warning/20 text-warning' :
          'bg-success/20 text-success'
        )}>
          {data.chainsawDetected && <AlertTriangle className="w-4 h-4 alert-flash" />}
          {data.chainsawDetected ? 'CHAINSAW DETECTED' : 'Background Noise'}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chainsaw Probability */}
        <div className="flex flex-col items-center p-4 bg-background/50 rounded-xl border border-border/50">
          <CircularProgress
            value={chainsawConfidence}
            size={140}
            strokeWidth={10}
            label="Chainsaw"
            variant={variant}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Detection Confidence</p>
            <p className={cn(
              'text-lg font-semibold',
              data.chainsawDetected ? 'text-destructive' : 'text-success'
            )}>
              {data.chainsawDetected ? 'HIGH ALERT' : 'Clear'}
            </p>
          </div>
        </div>

        {/* Waveform & Metrics */}
        <div className="flex flex-col gap-4">
          {/* Waveform */}
          <div className="p-4 bg-background/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">AUDIO WAVEFORM</span>
            </div>
            <WaveformVisualizer rms={data.backgroundRms} peak={data.peakAmplitude} />
          </div>

          {/* Audio Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-background/50 rounded-xl border border-border/50 text-center">
              <p className="text-2xl font-mono font-bold text-foreground">
                {data.backgroundRms.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground">RMS Level</p>
            </div>
            <div className="p-4 bg-background/50 rounded-xl border border-border/50 text-center">
              <p className="text-2xl font-mono font-bold text-foreground">
                {data.peakAmplitude.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground">Peak Amplitude</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
