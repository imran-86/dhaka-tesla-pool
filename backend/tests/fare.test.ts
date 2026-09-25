
// import { FareService } from '../src/services/fare.service';
import { FareService } from '../src/services/fair.service';
describe('Fare Calculation Engine (Section 5)', () => {
  // ১. নুসরাতের ট্রিপ টেস্ট (Banani -> Mohakhali: 3.0 km)
  it('should calculate Nusrat\'s pooled fare correctly to exactly 60 Taka (6000 Poysha)', () => {
    const result = FareService.calculateFare('Banani', 'Mohakhali', true);

    // Formula: 30 Tk (base) + 3.0 * 15 Tk (distance: 45 Tk) = 75 Tk subtotal
    // Pool discount (20%): 15 Tk
    // Expected final: 60 Tk = 6000 Poysha
    expect(result.distanceKm).toBe(3.0);
    expect(result.baseFareTaka).toBe(30);
    expect(result.distanceChargeTaka).toBe(45);
    expect(result.poolDiscountTaka).toBe(15);
    expect(result.totalFareTaka).toBe(60);
    expect(result.farePoysha).toBe(6000);
  });

  // ২. রফিকের ট্রিপ টেস্ট (Banani -> Gulshan 1: 2.5 km)
  it('should calculate Rafiq\'s pooled fare correctly to exactly 54 Taka (5400 Poysha)', () => {
    const result = FareService.calculateFare('Banani', 'Gulshan 1', true);

    // Formula: 30 Tk (base) + 2.5 * 15 Tk (distance: 37.5 Tk) = 67.5 Tk subtotal
    // Pool discount (20%): 13.5 Tk
    // Expected final: 54 Tk = 5400 Poysha
    expect(result.distanceKm).toBe(2.5);
    expect(result.totalFareTaka).toBe(54);
    expect(result.farePoysha).toBe(5400);
  });
});