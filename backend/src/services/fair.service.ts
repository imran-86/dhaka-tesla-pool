import { FARE_CONFIG, ZONE_DISTANCES_KM } from '../utils/constants';

export interface FareBreakdown {
  baseFareTaka: number;
  distanceKm: number;
  distanceChargeTaka: number;
  poolDiscountTaka: number;
  totalFareTaka: number;
  farePoysha: number; // Stored in DB
}

export class FareService {
  
  static calculateFare(
    pickup: string,
    destination: string,
    isPooled: boolean = true
  ): FareBreakdown {
    // 1. Determine distance (default to 2 km if route not explicitly mapped)
    const distanceKm = ZONE_DISTANCES_KM[pickup]?.[destination] ?? 2.0;

    // 2. Base fare in Poysha
    const baseFarePoysha = FARE_CONFIG.BASE_FARE_POYSHA;

    // 3. Distance charge in Poysha
    const distanceChargePoysha = Math.round(distanceKm * FARE_CONFIG.PER_KM_RATE_POYSHA);

    const subtotalPoysha = baseFarePoysha + distanceChargePoysha;

    // 4. Pool discount (applied if shared Tesla)
    const poolDiscountPoysha = isPooled
      ? Math.round((subtotalPoysha * FARE_CONFIG.POOL_DISCOUNT_PERCENTAGE) / 100)
      : 0;

    // 5. Total fare
    const finalFarePoysha = subtotalPoysha - poolDiscountPoysha;

    return {
      baseFareTaka: baseFarePoysha / 100,
      distanceKm,
      distanceChargeTaka: distanceChargePoysha / 100,
      poolDiscountTaka: poolDiscountPoysha / 100,
      totalFareTaka: finalFarePoysha / 100,
      farePoysha: finalFarePoysha,
    };
  }

  /**
   * Checks if two rides are compatible to share the same Tesla Bullet
   */
  static areRoutesCompatible(pickup1: string, drop1: string, pickup2: string, drop2: string): boolean {
    // Both must originate from the same pickup hub (e.g. Banani)
    if (pickup1 !== pickup2) return false;

    // Destination must be in the approved corridor
    const dropoffZones = [drop1, drop2];
    const bananiCorridor = ['Mohakhali', 'Gulshan 1', 'Gulshan 2'];
    
    return dropoffZones.every(zone => bananiCorridor.includes(zone));
  }
}