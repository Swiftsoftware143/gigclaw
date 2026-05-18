/**
 * Geolocation Utilities for GigClaw
 */

import { Coordinates, DirectionVector } from './types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(a: Coordinates, b: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  
  const a2 = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
  
  return R * c;
}

/**
 * Calculate direction vector from point A to point B
 */
export function calculateDirection(from: Coordinates, to: Coordinates): DirectionVector {
  return {
    lat: to.lat - from.lat,
    lng: to.lng - from.lng,
  };
}

/**
 * Check if two directions are roughly the same (within tolerance degrees)
 */
export function isSameDirection(
  current: Coordinates,
  primaryDirection: DirectionVector,
  newPoint: Coordinates,
  toleranceDegrees: number
): boolean {
  const newDirection = calculateDirection(current, newPoint);
  
  // Normalize vectors
  const primaryMag = Math.sqrt(primaryDirection.lat ** 2 + primaryDirection.lng ** 2);
  const newMag = Math.sqrt(newDirection.lat ** 2 + newDirection.lng ** 2);
  
  if (primaryMag === 0 || newMag === 0) return false;
  
  const primaryNorm = {
    lat: primaryDirection.lat / primaryMag,
    lng: primaryDirection.lng / primaryMag,
  };
  const newNorm = {
    lat: newDirection.lat / newMag,
    lng: newDirection.lng / newMag,
  };
  
  // Calculate angle between vectors using dot product
  const dotProduct = primaryNorm.lat * newNorm.lat + primaryNorm.lng * newNorm.lng;
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
  const angleDegrees = angleRadians * (180 / Math.PI);
  
  return angleDegrees <= toleranceDegrees;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
