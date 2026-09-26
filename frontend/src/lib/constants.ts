/**
 * Predefined geographic zones in Dhaka (PRD Section 4)
 * Keeping geography simple without external map APIs.
 */
export const DHAKA_ZONES = [
  'Banani',
  'Mohakhali',
  'Gulshan 1',
  'Gulshan 2',
  'Dhanmondi',
  'Farmgate',
  'Uttara',
  'Mirpur',
] as const;

export type DhakaZone = (typeof DHAKA_ZONES)[number];

/**
 * Deterministic Corridor definitions for pooling
 */
export const CORRIDORS = {
  BANANI_CORRIDOR: 'Banani-Southbound',
  GULSHAN_CORRIDOR: 'Gulshan-Corridor',
} as const;

/**
 * Story cast demo credentials (PRD Section 1 & Section 12)
 * Universal seed password for evaluator verification.
 */
export const DEMO_CREDENTIALS = {
  DEFAULT_PASSWORD: 'Tesla@123',
  PERSONAS: [
    {
      name: 'Nusrat',
      role: 'PASSENGER',
      phone: '01810000001',
      description: 'Banani → Mohakhali (Pooled Trip)',
      pickup: 'Banani',
      destination: 'Mohakhali',
    },
    {
      name: 'Rafiq',
      role: 'PASSENGER',
      phone: '01910000001',
      description: 'Banani → Gulshan 1 (Pooled Trip)',
      pickup: 'Banani',
      destination: 'Gulshan 1',
    },
    {
      name: 'Shirin',
      role: 'PASSENGER',
      phone: '01610000001',
      description: 'Late booker for Bullet last seat',
      pickup: 'Banani',
      destination: 'Gulshan 1',
    },
    {
      name: 'Jashim',
      role: 'DRIVER',
      phone: '01710000001',
      description: 'Driver of 3-seater Bullet',
    },
  ],
} as const;

/**
 * Vehicle and capacity constants (PRD Section 1 & 3)
 */
export const VEHICLE_CONFIG = {
  MODEL_NAME: 'Bullet',
  MAX_CAPACITY: 3,
} as const;

/**
 * Fare Calculation Formula Constants (PRD Section 5)
 * passengerFare = baseFare + distanceCharge - poolDiscount
 */
export const FARE_CONFIG = {
  BASE_FARE_TAKA: 30,
  PER_KM_RATE_TAKA: 15,
  POOL_DISCOUNT_PERCENT: 20, // 20% discount if pooled
} as const;