/**
 * GigClaw - Gig App Automation Module
 * 
 * Auto-accept orders from multiple gig apps with geofence,
 * destination mode, and smart batching.
 */

import { GigConfig } from './types';

export { GigDetector } from './GigDetector';
export * from './types';
export * from './geo';

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
};
