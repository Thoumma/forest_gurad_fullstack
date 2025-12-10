import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, Alert, ConnectionStatus } from '@/types/sensor';

// Dynamic WebSocket URL based on current hostname
const getWebSocketUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8000/ws`;
};

const WS_URL = getWebSocketUrl();
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const DEMO_MODE_INTERVAL = 3000;

const generateDemoData = (): SensorData => {
  const baseTemp = 25 + Math.random() * 15;
  const tempSpike = Math.random() > 0.95;
  const temperature = tempSpike ? baseTemp + 15 : baseTemp;
  const humidity = 40 + Math.random() * 40;
  const smoke = Math.random() * 30 + (tempSpike ? 40 : 0);
  const fireRisk = Math.min(100, (temperature - 25) * 2 + (100 - humidity) * 0.5 + smoke * 0.8);

  return {
    deviceId: 'DEMO_ESP32',
    timestamp: new Date(),
    temperature,
    humidity,
    smoke,
    backgroundRms: 0.02 + Math.random() * 0.08,
    peakAmplitude: 0.1 + Math.random() * 0.3,
    fireRisk,
    fireStage: (fireRisk < 15 ? 0 : fireRisk < 30 ? 1 : fireRisk < 50 ? 2 : fireRisk < 70 ? 3 : fireRisk < 85 ? 4 : 5) as 0 | 1 | 2 | 3 | 4 | 5,
    chainsawProbability: Math.random() * 0.15,
    chainsawDetected: false,
    tempSpike,
  };
};

export const useSensorData = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    lastPing: null,
    clientId: null,
    reconnectAttempts: 0,
  });
  const [demoMode, setDemoMode] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, resolved: true } : a
    ));
  }, []);

  const startDemoMode = useCallback(() => {
    console.log('🎮 Starting demo mode with simulated data');
    setDemoMode(true);
    setConnectionStatus(prev => ({
      ...prev,
      connected: true,
      clientId: 'demo-mode',
      lastPing: new Date(),
    }));

    demoIntervalRef.current = setInterval(() => {
      const newData = generateDemoData();
      setSensorData(newData);
      setSensorHistory(prev => [...prev, newData].slice(-60));
      setConnectionStatus(prev => ({ ...prev, lastPing: new Date() }));

      if (newData.tempSpike && Math.random() > 0.5) {
        const newAlert: Alert = {
          id: `demo_alert_${Date.now()}`,
          deviceId: 'DEMO_ESP32',
          timestamp: new Date(),
          severity: 'high',
          type: 'temp_spike',
          message: `Demo: Temperature spike detected (${newData.temperature.toFixed(1)}°C)`,
          resolved: false,
          fireRisk: newData.fireRisk,
          fireStage: newData.fireStage,
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      }
    }, DEMO_MODE_INTERVAL);
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log('🔌 Connecting to WebSocket:', WS_URL);

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setConnectionStatus(prev => ({
          ...prev,
          connected: true,
          reconnectAttempts: 0,
          lastPing: new Date(),
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WS Message:', data.type, data);

          switch (data.type) {
            case 'connected':
              setConnectionStatus(prev => ({
                ...prev,
                clientId: data.clientId,
                lastPing: new Date(),
              }));
              break;

            case 'fire_update':
            case 'sensor_data': {
              // ✅ FIXED: Match backend broadcast keys exactly
              const newSensorData: SensorData = {
                deviceId: data.deviceId || 'ESP_klab',
                timestamp: new Date(data.timestamp),
                temperature: data.temperature ?? 0,
                humidity: data.humidity ?? 0,
                smoke: data.smoke ?? 0,
                // ✅ FIXED: Backend sends background_rms and peak_amplitude directly
                backgroundRms: data.background_rms ?? 0,
                peakAmplitude: data.peak_amplitude ?? 0,
                fireRisk: data.fire_risk ?? 0,
                fireStage: (data.fire_stage ?? 0) as 0 | 1 | 2 | 3 | 4 | 5,
                chainsawProbability: data.chainsaw_prob ?? 0,
                chainsawDetected: data.chainsaw_detected ?? false,
                tempSpike: data.temp_spike ?? false,
              };

              console.log('🎙️ Sound data received:', {
                backgroundRms: newSensorData.backgroundRms,
                peakAmplitude: newSensorData.peakAmplitude,
                chainsawProb: newSensorData.chainsawProbability,
              });

              setSensorData(newSensorData);
              setSensorHistory(prev => [...prev, newSensorData].slice(-60));
              setConnectionStatus(prev => ({ ...prev, lastPing: new Date() }));
              break;
            }

            case 'sound_update': {
              // Legacy support for separate sound updates
              setSensorData(prev => prev ? {
                ...prev,
                backgroundRms: data.background_rms ?? prev.backgroundRms,
                peakAmplitude: data.peak_amplitude ?? prev.peakAmplitude,
                chainsawProbability: data.chainsaw_prob ?? prev.chainsawProbability,
                chainsawDetected: data.chainsaw_detected ?? prev.chainsawDetected,
              } : prev);
              break;
            }

            case 'alert': {
              const newAlert: Alert = {
                id: data.id || `alert_${Date.now()}`,
                deviceId: data.deviceId || 'ESP_klab',
                timestamp: new Date(data.timestamp),
                severity: data.severity || 'medium',
                type: data.chainsawDetected ? 'chainsaw' : data.tempSpike ? 'temp_spike' : 'fire',
                message: data.message,
                resolved: false,
                fireRisk: data.fireRisk ?? data.fire_risk,
                fireStage: data.fireStage ?? data.fire_stage,
              };
              setAlerts(prev => [newAlert, ...prev].slice(0, 20));
              break;
            }

            case 'heartbeat':
            case 'pong':
              setConnectionStatus(prev => ({ ...prev, lastPing: new Date() }));
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        wsRef.current = null;

        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
        }));

        setConnectionStatus(prev => {
          if (prev.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log(`🔄 Reconnecting in ${RECONNECT_DELAY}ms (attempt ${prev.reconnectAttempts + 1})`);
            reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
            return { ...prev, reconnectAttempts: prev.reconnectAttempts + 1 };
          }
          console.log('🎮 Max reconnect attempts reached, switching to demo mode');
          startDemoMode();
          return prev;
        });
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      startDemoMode();
    }
  }, [startDemoMode]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    sensorData,
    sensorHistory,
    alerts,
    connectionStatus,
    dismissAlert,
    demoMode,
  };
};