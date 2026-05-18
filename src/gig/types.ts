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
  // Schedule & Zone features
  schedule: WeeklySchedule;
  zones: Record<string, Zone>;
  acceptFutureOrders: boolean;
  maxFutureDays: number; // How many days ahead to accept
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // "08:00" (24-hour format)
  endTime: string;   // "17:00"
  zoneId: string;    // Reference to zones
}

export interface Zone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radiusMiles: number;
  addresses: string[]; // Alternative: list of addresses defining zone
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
  orderDateTime?: Date; // When the order is scheduled for
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
