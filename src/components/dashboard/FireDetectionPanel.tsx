import { SensorData, FIRE_STAGE_LABELS, FireStage } from '@/types/sensor';
import { GaugeChart } from './GaugeChart';
import { CircularProgress } from './CircularProgress';
import { cn } from '@/lib/utils';
import { Flame, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';

interface FireDetectionPanelProps {
  data: SensorData | null;
}

export const FireDetectionPanel = ({ data }: FireDetectionPanelProps) => {
  if (!data) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 card-glow animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const fireStage = data.fireStage as FireStage;
  const riskVariant = data.fireRisk >= 80 ? 'danger' : data.fireRisk >= 60 ? 'warning' : data.fireRisk >= 30 ? 'warning' : 'success';
  
  const glowClass = data.fireRisk >= 80 ? 'card-glow-danger' : 
                    data.fireRisk >= 60 ? 'card-glow-warning' : 'card-glow';

  return (
    <div className={cn('bg-card rounded-xl border border-border p-6 transition-all duration-300', glowClass)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            data.fireRisk >= 60 ? 'bg-destructive/20' : 'bg-primary/20'
          )}>
            <Flame className={cn(
              'w-5 h-5',
              data.fireRisk >= 60 ? 'text-destructive' : 'text-primary'
            )} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Fire Detection</h2>
            <p className="text-sm text-muted-foreground">Real-time environmental monitoring</p>
          </div>
        </div>
        
        {/* Fire Stage Badge */}
        <div className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2',
          data.fireRisk >= 80 ? 'bg-destructive/20 text-destructive' :
          data.fireRisk >= 60 ? 'bg-orange-500/20 text-orange-400' :
          data.fireRisk >= 30 ? 'bg-warning/20 text-warning' :
          'bg-success/20 text-success'
        )}>
          {data.fireRisk >= 60 && <AlertTriangle className="w-4 h-4 alert-flash" />}
          Stage {fireStage}: {FIRE_STAGE_LABELS[fireStage]}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Fire Risk - Large Circle */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 bg-background/50 rounded-xl border border-border/50">
          <CircularProgress
            value={data.fireRisk}
            size={160}
            strokeWidth={12}
            label="Fire Risk"
            variant={riskVariant}
          />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Risk Level</p>
            <p className={cn(
              'text-lg font-semibold',
              data.fireRisk >= 80 ? 'text-destructive' :
              data.fireRisk >= 60 ? 'text-orange-400' :
              data.fireRisk >= 30 ? 'text-warning' : 'text-success'
            )}>
              {data.fireRisk >= 80 ? 'CRITICAL' :
               data.fireRisk >= 60 ? 'HIGH' :
               data.fireRisk >= 30 ? 'MODERATE' : 'NORMAL'}
            </p>
          </div>
        </div>

        {/* Sensor Gauges */}
        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
          {/* Temperature */}
          <div className="flex flex-col items-center p-4 bg-background/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-muted-foreground font-medium">TEMP</span>
            </div>
            <GaugeChart
              value={data.temperature}
              max={60}
              label=""
              unit="°C"
              size="sm"
              thresholds={{ low: 50, medium: 67, high: 83 }}
            />
            {data.tempSpike && (
              <span className="mt-2 text-xs text-destructive font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> SPIKE
              </span>
            )}
          </div>

          {/* Humidity */}
          <div className="flex flex-col items-center p-4 bg-background/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground font-medium">HUMIDITY</span>
            </div>
            <GaugeChart
              value={data.humidity}
              max={100}
              label=""
              unit="%"
              size="sm"
              thresholds={{ low: 60, medium: 40, high: 20 }}
            />
          </div>

          {/* Smoke */}
          <div className="flex flex-col items-center p-4 bg-background/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Wind className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-muted-foreground font-medium">SMOKE</span>
            </div>
            <GaugeChart
              value={data.smoke}
              max={100}
              label=""
              unit="PPM"
              size="sm"
              thresholds={{ low: 20, medium: 50, high: 75 }}
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-6 pt-4 border-t border-border/50 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{data.temperature.toFixed(1)}°</p>
          <p className="text-xs text-muted-foreground">Temperature</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{data.humidity.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">Humidity</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-foreground">{data.smoke.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Smoke PPM</p>
        </div>
        <div className="text-center">
          <p className={cn(
            'text-2xl font-mono font-bold',
            data.fireRisk >= 60 ? 'text-destructive' : 'text-success'
          )}>{data.fireRisk.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Fire Risk</p>
        </div>
      </div>
    </div>
  );
};
