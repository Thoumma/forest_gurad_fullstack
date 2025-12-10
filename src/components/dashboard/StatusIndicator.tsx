import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Activity } from 'lucide-react';

interface StatusIndicatorProps {
  connected: boolean;
  lastPing: Date | null;
  className?: string;
}

export const StatusIndicator = ({ connected, lastPing, className }: StatusIndicatorProps) => {
  const timeSinceLastPing = lastPing
    ? Math.floor((Date.now() - lastPing.getTime()) / 1000)
    : null;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-success status-online" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping opacity-75" />
            </div>
            <Wifi className="w-4 h-4 text-success" />
          </>
        ) : (
          <>
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <WifiOff className="w-4 h-4 text-destructive" />
          </>
        )}
      </div>
      
      <div className="flex flex-col">
        <span className={cn(
          'text-sm font-medium',
          connected ? 'text-success' : 'text-destructive'
        )}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
        {timeSinceLastPing !== null && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Last ping: {timeSinceLastPing}s ago
          </span>
        )}
      </div>
    </div>
  );
};
