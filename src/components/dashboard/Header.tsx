import { StatusIndicator } from './StatusIndicator';
import { ConnectionStatus } from '@/types/sensor';
import { TreePine, Shield } from 'lucide-react';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  deviceId: string;
}

export const Header = ({ connectionStatus, deviceId }: HeaderProps) => {
  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg" />
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-xl border border-primary/30">
                <TreePine className="w-7 h-7 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Forest Guard AI
                <Shield className="w-4 h-4 text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time Forest Monitoring System
              </p>
            </div>
          </div>

          {/* Status & Device Info */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium text-foreground">{deviceId}</span>
              <span className="text-xs text-muted-foreground">Active Device</span>
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <StatusIndicator
              connected={connectionStatus.connected}
              lastPing={connectionStatus.lastPing}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
