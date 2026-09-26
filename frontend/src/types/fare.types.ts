// frontend/src/types/fare.types.ts

export interface FareCalculationResult {
  pickupZone: string;
  destinationZone: string;
  distanceKm: number;
  baseFareTaka: number;
  distanceChargeTaka: number;
  poolDiscountTaka: number;
  totalFareTaka: number;
  farePoysha: number; // Stored as integer Poysha (1 Taka = 100 Poysha)
  isPooled: boolean;
}

export interface FareEstimatePayload {
  pickupZone: string;
  destinationZone: string;
  isPooled?: boolean;
}