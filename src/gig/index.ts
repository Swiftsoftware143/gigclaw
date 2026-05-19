/**
 * GigClaw - Gig App Automation Module
 * 
 * Auto-accept orders from multiple gig apps with geofence,
 * destination mode, and smart batching.
 */

import { GigConfig, DaySchedule } from './types';

export { GigDetector } from './GigDetector';
export * from './types';
export * from './geo';

const createDefaultDaySchedule = (): DaySchedule => ({
  enabled: true,
  timeSlots: [
    { startTime: '08:00', endTime: '12:00', zoneId: 'default' },
    { startTime: '13:00', endTime: '17:00', zoneId: 'default' },
  ],
});

export const DEFAULT_CONFIG: GigConfig = {
  defaultRadiusMiles: 5,
  maxBatchSize: 3,
  batchWindowMinutes: 5,
  directionToleranceDegrees: 45,
  destinationMode: {
    enabled: false,
  },
  apps: {
    senpex: { enabled: true, minPay: 10 },
    curri: { enabled: true, minPay: 10 },
    airspace: { enabled: true, minPay: 10 },
    frayt: { enabled: true, minPay: 10 },
    roadie: { enabled: true, minPay: 10 },
    courial: { enabled: true, minPay: 10 },
    goshare: { enabled: true, minPay: 10 },
  },
  schedule: {
    monday: createDefaultDaySchedule(),
    tuesday: createDefaultDaySchedule(),
    wednesday: createDefaultDaySchedule(),
    thursday: createDefaultDaySchedule(),
    friday: createDefaultDaySchedule(),
    saturday: { enabled: false, timeSlots: [] },
    sunday: { enabled: false, timeSlots: [] },
  },
  zones: {
    default: {
      id: 'default',
      name: 'Default Zone',
      center: { lat: 0, lng: 0 },
      radiusMiles: 10,
      addresses: [],
    },
  },
  acceptFutureOrders: true,
  maxFutureDays: 7,
  guardrails: {
    enabled: true,
    maxAcceptsPerHour: 8,
    maxAcceptsPerDay: 30,
    minTimeBetweenAcceptsMs: 5000, // 5 seconds minimum
    randomizeTapLocation: true,
    randomizeTapDelay: true,
    humanLikeScrolls: true,
    maxConsecutiveAccepts: 3,
    breakDurationMs: 300000, // 5 minute break
    declineRatio: 0.1, // Decline 10% of borderline orders
    activityVariance: true,
  },
};
