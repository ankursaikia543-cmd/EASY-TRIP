import { FareCalculationResult, LocationPoint, PlatformSettings, VehicleType, Coupon } from '../types';

export class FareService {
  /**
   * Calculates realistic driving road distance in kilometers using known Assam corridors
   * and high-precision Haversine with road circuity routing factor.
   */
  public static calculateDistanceKm(from: LocationPoint, to: LocationPoint): number {
    if (!from || !to) return 3.5;
    
    // If exact same coordinate
    if (from.lat === to.lat && from.lng === to.lng) {
      return 1.2;
    }

    const fromText = `${from.address || ''} ${from.city || ''}`.toLowerCase();
    const toText = `${to.address || ''} ${to.city || ''}`.toLowerCase();

    // Check specific known Assam Highway corridors for exact road distance accuracy
    const matchPair = (k1: string, k2: string) => 
      (fromText.includes(k1) && toText.includes(k2)) || (fromText.includes(k2) && toText.includes(k1));

    if (matchPair('bokakhat', 'golaghat')) return 48.5;
    if (matchPair('bokakhat', 'kohora') || matchPair('bokakhat', 'kaziranga')) return 22.4;
    if (matchPair('bokakhat', 'numaligarh')) return 21.0;
    if (matchPair('bokakhat', 'dergaon')) return 35.2;
    if (matchPair('bokakhat', 'jorhat')) return 64.8;
    if (matchPair('bokakhat', 'guwahati')) return 234.0;
    if (matchPair('bokakhat', 'dibrugarh')) return 204.0;
    if (matchPair('bokakhat', 'sarupathar')) return 78.0;

    if (matchPair('golaghat', 'dergaon')) return 26.5;
    if (matchPair('golaghat', 'jorhat')) return 54.0;
    if (matchPair('golaghat', 'furkating')) return 11.2;
    if (matchPair('golaghat', 'sarupathar')) return 55.4;
    if (matchPair('golaghat', 'barpathar')) return 42.0;
    if (matchPair('golaghat', 'numaligarh')) return 27.8;
    if (matchPair('golaghat', 'guwahati')) return 278.0;
    if (matchPair('golaghat', 'dibrugarh')) return 194.0;
    if (matchPair('golaghat', 'dimapur')) return 88.5;
    if (matchPair('golaghat', 'sivasagar')) return 96.0;

    if (matchPair('dergaon', 'jorhat')) return 28.0;
    if (matchPair('dergaon', 'numaligarh')) return 18.5;
    if (matchPair('numaligarh', 'morangi')) return 12.4;
    if (matchPair('numaligarh', 'dergaon')) return 18.5;

    // High-precision Haversine distance with real-world road curvature factor (1.32x for Assam regional topography)
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

    // Apply realistic Assam road routing curvature factor (1.30 - 1.35x)
    const routedDistance = Math.max(1.2, straightDist * 1.32);
    return Math.round(routedDistance * 10) / 10;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Estimates driving duration in minutes based on real distance and vehicle average city/highway speed
   */
  public static estimateDurationMin(distanceKm: number, vehicleType: VehicleType): number {
    // Average realistic speeds on Assam roads & NH-715 (km/h)
    let avgSpeed = 38; // Cab average
    if (vehicleType === 'bike') avgSpeed = 42; // Bike navigates village/town traffic faster
    if (vehicleType === 'auto') avgSpeed = 28; // Auto rickshaw cruising speed

    if (distanceKm > 60) {
      // Long highway trips maintain slightly higher cruising speed
      avgSpeed += 6;
    }

    const baseMin = Math.round((distanceKm / avgSpeed) * 60);
    // Buffer for town junctions, traffic lights, and pickup
    const bufferMin = distanceKm <= 5 ? 3 : distanceKm <= 20 ? 5 : 8;
    return Math.max(4, baseMin + bufferMin);
  }

  /**
   * Formats duration in minutes into a clean human-readable string (e.g., "45 mins" or "1 hr 25 mins")
   */
  public static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const remMin = minutes % 60;
    if (remMin === 0) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
    }
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${remMin} mins`;
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
      baseFare: vehicleType === 'bike' ? 25 : vehicleType === 'auto' ? 35 : 65,
      pricePerKm: vehicleType === 'bike' ? 9 : vehicleType === 'auto' ? 13 : 17,
      minimumFare: vehicleType === 'bike' ? 25 : vehicleType === 'auto' ? 35 : 65,
      perMinuteRate: 1.5,
    };

    const baseFare = rate.baseFare;
    const distanceFare = Math.round(distanceKm * rate.pricePerKm);
    const timeFare = Math.round(Math.max(0, durationMin - 15) * (rate.perMinuteRate || 1.0) * 0.4);
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

