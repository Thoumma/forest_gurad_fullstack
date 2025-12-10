export interface SensorData {
  deviceId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  smoke: number;
  backgroundRms: number;
  peakAmplitude: number;
  fireRisk: number;
  fireStage: number;
  chainsawProbability: number;
  chainsawDetected: boolean;
  tempSpike: boolean;
}

export interface Alert {
  id: string;
  deviceId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'fire' | 'chainsaw' | 'temp_spike' | 'connection';
  message: string;
  fireRisk?: number;
  fireStage?: number;
  timestamp: Date;
  resolved: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  lastPing: Date | null;
  clientId: string | null;
  reconnectAttempts: number;
}

export type FireStage = 0 | 1 | 2 | 3 | 4 | 5;

export const FIRE_STAGE_LABELS: Record<FireStage, string> = {
  0: 'Normal',
  1: 'Low Risk',
  2: 'Elevated',
  3: 'Moderate',
  4: 'High',
  5: 'Critical',
};

export const FIRE_STAGE_COLORS: Record<FireStage, string> = {
  0: 'text-success',
  1: 'text-success',
  2: 'text-warning',
  3: 'text-warning',
  4: 'text-destructive',
  5: 'text-destructive',
};
