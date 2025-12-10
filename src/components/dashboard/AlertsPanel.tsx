import { Alert } from '@/types/sensor';
import { cn } from '@/lib/utils';
import { AlertTriangle, Flame, Volume2, Thermometer, X, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

const alertIcons = {
  fire: Flame,
  chainsaw: Volume2,
  temp_spike: Thermometer,
  connection: AlertTriangle,
};

const severityStyles = {
  low: 'border-l-success bg-success/5',
  medium: 'border-l-warning bg-warning/5',
  high: 'border-l-orange-500 bg-orange-500/5',
  critical: 'border-l-destructive bg-destructive/5',
};

const severityBadgeStyles = {
  low: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-destructive/20 text-destructive',
};

export const AlertsPanel = ({ alerts, onDismiss }: AlertsPanelProps) => {
  const activeAlerts = alerts.filter(a => !a.resolved);
  const recentAlerts = activeAlerts.slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-6 card-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-lg',
            activeAlerts.length > 0 ? 'bg-destructive/20' : 'bg-primary/20'
          )}>
            <Bell className={cn(
              'w-5 h-5',
              activeAlerts.length > 0 ? 'text-destructive' : 'text-primary'
            )} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Active Alerts</h2>
            <p className="text-sm text-muted-foreground">
              {activeAlerts.length} active {activeAlerts.length === 1 ? 'alert' : 'alerts'}
            </p>
          </div>
        </div>

        {activeAlerts.length > 0 && (
          <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium animate-pulse">
            {activeAlerts.length} ACTIVE
          </span>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No active alerts</p>
            <p className="text-xs opacity-70">All systems normal</p>
          </div>
        ) : (
          recentAlerts.map((alert) => {
            const Icon = alertIcons[alert.type];
            return (
              <div
                key={alert.id}
                className={cn(
                  'relative p-4 rounded-lg border-l-4 border border-border/50 transition-all animate-slide-up',
                  severityStyles[alert.severity]
                )}
              >
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>

                <div className="flex items-start gap-3">
                  <Icon className={cn(
                    'w-5 h-5 mt-0.5',
                    alert.severity === 'critical' ? 'text-destructive alert-flash' :
                    alert.severity === 'high' ? 'text-orange-400' :
                    alert.severity === 'medium' ? 'text-warning' : 'text-success'
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-xs font-medium uppercase',
                        severityBadgeStyles[alert.severity]
                      )}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium truncate">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Device: {alert.deviceId}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
