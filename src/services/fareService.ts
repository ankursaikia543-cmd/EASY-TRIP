import { FareCalculationResult, LocationPoint, PlatformSettings, VehicleType, Coupon } from '../types';

export class FareService {
  /**
   * Calculates straight-line distance in kilometers using the Haversine formula
   * Multiplied by a realistic city transit circuity factor of 1.25x for driving distance
   */
  public static calculateDistanceKm(from: LocationPoint, to: LocationPoint): number {
    if (!from || !to) return 3.5;
    
    // If exact same coordinate
    if (from.lat === to.lat && from.lng === to.lng) {
      return 1.2;
    }

    const R = 6371; // Radius of Earth in km
    const dLat = this.deg2rad(to.lat - from.lat);
    const dLon = this.deg2rad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(from.lat)) *
        Math.cos(this.deg2rad(to.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;

    // Apply city road circuity routing factor (1.25 - 1.35x)
    const routedDistance = straightDist * 1.28;
    return Math.max(1.0, Math.round(routedDistance * 10) / 10);
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Estimates driving duration in minutes based on distance and vehicle average city speed
   */
  public static estimateDurationMin(distanceKm: number, vehicleType: VehicleType): number {
    // Average urban speeds in Indian cities (km/h)
    let avgSpeed = 24; // Cab
    if (vehicleType === 'bike') avgSpeed = 32; // Bike weaves through traffic faster
    if (vehicleType === 'auto') avgSpeed = 22; // Auto average speed

    const baseMin = Math.round((distanceKm / avgSpeed) * 60);
    // Add 3-5 mins for traffic signal delays & pickup buffer
    return Math.max(5, baseMin + 3);
  }

  /**
   * Calculates comprehensive upfront fare with base fare, distance rate, surge, and coupon discounts
   */
  public static calculateFare(
    vehicleType: VehicleType,
    distanceKm: number,
    durationMin: number,
    settings: PlatformSettings,
    coupon?: Coupon | null
  ): FareCalculationResult {
    const rate = settings.fares[vehicleType] || {
      baseFare: vehicleType === 'bike' ? 30 : vehicleType === 'auto' ? 40 : 70,
      pricePerKm: vehicleType === 'bike' ? 10 : vehicleType === 'auto' ? 14 : 18,
      minimumFare: vehicleType === 'bike' ? 30 : vehicleType === 'auto' ? 40 : 70,
      perMinuteRate: 1.5,
    };

    const baseFare = rate.baseFare;
    const distanceFare = Math.round(distanceKm * rate.pricePerKm);
    const timeFare = Math.round(Math.max(0, durationMin - 10) * rate.perMinuteRate * 0.5); // Minor traffic time buffer
    const surgeMultiplier = settings.surgePricingEnabled ? (settings.surgeMultiplier || 1.0) : 1.0;

    let subtotal = (baseFare + distanceFare + timeFare) * surgeMultiplier;
    subtotal = Math.max(subtotal, rate.minimumFare * surgeMultiplier);

    // Apply GST / Platform safety fee (5%)
    const tax = Math.round(subtotal * 0.05);

    let discount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (coupon && coupon.active) {
      if (subtotal >= coupon.minimumFare) {
        appliedCouponCode = coupon.code;
        if (coupon.discountType === 'flat') {
          discount = Math.min(coupon.discountValue, subtotal, coupon.maximumDiscount);
        } else {
          const pctDiscount = Math.round((subtotal * coupon.discountValue) / 100);
          discount = Math.min(pctDiscount, coupon.maximumDiscount);
        }
      }
    }

    const totalFare = Math.max(rate.minimumFare, Math.round(subtotal + tax - discount));

    return {
      baseFare,
      distanceKm,
      distanceFare,
      timeFare,
      surgeMultiplier,
      subtotal: Math.round(subtotal),
      discount,
      tax,
      totalFare,
      couponCode: appliedCouponCode,
    };
  }
}
