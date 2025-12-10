import { useSensorData } from '@/hooks/useSensorData';
import { Header } from '@/components/dashboard/Header';
import { FireDetectionPanel } from '@/components/dashboard/FireDetectionPanel';
import { SoundDetectionPanel } from '@/components/dashboard/SoundDetectionPanel';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Thermometer, Droplets, Wind, Activity, Clock, Cpu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Index = () => {
  const { sensorData, alerts, connectionStatus, dismissAlert } = useSensorData();

  return (
    <div className="min-h-screen bg-background bg-noise">
      <Header
        connectionStatus={connectionStatus}
        deviceId={sensorData?.deviceId || 'ESP_klab'}
      />

      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <StatsCard
            title="Temperature"
            value={sensorData ? `${sensorData.temperature.toFixed(1)}°C` : '--'}
            icon={Thermometer}
            variant={sensorData && sensorData.temperature > 40 ? 'danger' : 'default'}
          />
          <StatsCard
            title="Humidity"
            value={sensorData ? `${sensorData.humidity.toFixed(0)}%` : '--'}
            icon={Droplets}
            variant={sensorData && sensorData.humidity < 30 ? 'warning' : 'default'}
          />
          <StatsCard
            title="Smoke PPM"
            value={sensorData ? sensorData.smoke.toFixed(1) : '--'}
            icon={Wind}
            variant={sensorData && sensorData.smoke > 50 ? 'danger' : 'default'}
          />
          <StatsCard
            title="Fire Risk"
            value={sensorData ? `${sensorData.fireRisk.toFixed(0)}%` : '--'}
            icon={Activity}
            variant={
              sensorData && sensorData.fireRisk >= 60 ? 'danger' :
              sensorData && sensorData.fireRisk >= 30 ? 'warning' : 'success'
            }
          />
          <StatsCard
            title="Last Update"
            value={sensorData ? formatDistanceToNow(sensorData.timestamp, { addSuffix: false }) : '--'}
            subtitle="ago"
            icon={Clock}
          />
          <StatsCard
            title="System Status"
            value={connectionStatus.connected ? 'Online' : 'Offline'}
            icon={Cpu}
            variant={connectionStatus.connected ? 'success' : 'danger'}
          />
        </div>

        {/* Main Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <FireDetectionPanel data={sensorData} />
          </div>
          <div>
            <AlertsPanel alerts={alerts} onDismiss={dismissAlert} />
          </div>
        </div>

        {/* Sound Detection */}
        <div className="grid grid-cols-1">
          <SoundDetectionPanel data={sensorData} />
        </div>

        {/* Footer */}
        <footer className="mt-8 py-4 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            🌲 Forest Guard AI • Real-time Monitoring System • 
            <span className="text-primary ml-1">v2.0.0</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
