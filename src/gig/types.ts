/**
 * GigClaw Type Definitions
 */

export interface GigConfig {
  defaultRadiusMiles: number;
  maxBatchSize: number;
  batchWindowMinutes: number;
  directionToleranceDegrees: number;
  destinationMode: {
    enabled: boolean;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  apps: Record<string, AppConfig>;
  geocodingApiKey?: string;
}

export interface AppConfig {
  enabled: boolean;
  minPay: number;
  radiusMiles?: number; // Override default
}

export interface OrderInfo {
  appName?: string;
  pay: number;
  distance?: number;
  pickupAddress?: string;
  dropoffAddress?: string;
  timestamp: number;
}

export interface ActiveBatch {
  orders: OrderInfo[];
  startTime: number;
  primaryDirection?: DirectionVector;
}

export interface DirectionVector {
  lat: number;
  lng: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}
