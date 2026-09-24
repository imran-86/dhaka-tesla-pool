export const DHAKA_ZONES = [
  'Banani',
  'Gulshan 1',
  'Gulshan 2',
  'Mohakhali',
  'Dhanmondi',
  'Mirpur',
  'Uttara',
  'Farmgate',
] as const;

export type DhakaZone = (typeof DHAKA_ZONES)[number];

/**
 * Corridor matching rule:
 * If passengers share the same pickup hub and travel along a compatible route,
 * they belong to the same pool corridor.
 */
export const COMPATIBLE_CORRIDORS: Record<string, string[]> = {
  // From Banani, heading south toward Mohakhali & Gulshan 1 are compatible
  'Banani': ['Mohakhali', 'Gulshan 1', 'Gulshan 2'],
};

/**
 * Simple distance matrix in kilometers between key Dhaka hubs.
 * Used for deterministic, hand-calculable fares.
 */
export const ZONE_DISTANCES_KM: Record<string, Record<string, number>> = {
  Banani: {
    'Mohakhali': 3.0,  // Nusrat's trip: 3 km
    'Gulshan 1': 2.5,   // Rafiq's trip: 2.5 km
    'Gulshan 2': 1.5,
  },
  Mohakhali: {
    'Banani': 3.0,
    'Gulshan 1': 2.0,
  },
  'Gulshan 1': {
    'Banani': 2.5,
    'Mohakhali': 2.0,
  },
};


export const FARE_CONFIG = {
  BASE_FARE_POYSHA: 3000,         // Base fare: 30 Taka (3000 Poysha)
  PER_KM_RATE_POYSHA: 1500,       // Distance charge: 15 Taka/km (1500 Poysha)
  POOL_DISCOUNT_PERCENTAGE: 20,   // 20% discount if the ride is pooled
};