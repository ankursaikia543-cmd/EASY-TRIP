export type UserRole = 'customer' | 'driver' | 'admin';

export type VehicleType = 'bike' | 'auto' | 'cab';

export type RideStatus = 
  | 'searching'
  | 'driver_assigned'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'upi' | 'wallet';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type DriverApprovalStatus = 'pending' | 'approved' | 'rejected';

export type DriverOnlineStatus = 'online' | 'offline';

export type DriverAvailabilityStatus = 'available' | 'busy';

export interface LocationPoint {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  landmark?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  role: UserRole;
  status: 'active' | 'blocked';
  walletBalance: number;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  photoURL?: string;
  vehicleType: VehicleType;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleNumber: string;
  licenseNumber: string;
  documents: {
    licenseUrl?: string;
    rcBookUrl?: string;
    insuranceUrl?: string;
    submittedAt: string;
  };
  approvalStatus: DriverApprovalStatus;
  rejectionReason?: string;
  onlineStatus: DriverOnlineStatus;
  availabilityStatus: DriverAvailabilityStatus;
  currentLocation: LocationPoint;
  rating: number;
  totalRatingsCount: number;
  totalRides: number;
  todayEarnings: number;
  totalEarnings: number;
  platformCommissionRate: number; // e.g. 0.15 for 15%
  createdAt: string;
}

export interface VehicleRateConfig {
  type: VehicleType;
  name: string;
  iconName: string;
  baseFare: number;
  pricePerKm: number;
  minimumFare: number;
  perMinuteRate: number;
  capacity: number;
  description: string;
}

export interface FareCalculationResult {
  baseFare: number;
  distanceKm: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  subtotal: number;
  discount: number;
  tax: number;
  totalFare: number;
  couponCode?: string;
}

export interface Ride {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerPhoto?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  driverRating?: number;
  vehicleType: VehicleType;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  vehicleColor?: string;
  otp: string; // 4-digit verification code
  pickup: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  estimatedDurationMin: number;
  estimatedFare: number;
  finalFare: number;
  fareBreakdown?: FareCalculationResult;
  couponCode?: string;
  discount?: number;
  surgeMultiplier?: number;
  status: RideStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'driver' | 'admin';
  driverLocation?: {
    lat: number;
    lng: number;
    bearing?: number;
  };
  createdAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  rating?: number;
  review?: string;
}

export interface PaymentRecord {
  id: string;
  rideId: string;
  customerId: string;
  driverId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  upiId?: string;
  createdAt: string;
}

export interface RatingReview {
  id: string;
  rideId: string;
  customerId: string;
  customerName: string;
  driverId: string;
  driverName: string;
  rating: number; // 1-5
  review?: string;
  tags?: string[];
  createdAt: string;
}

export interface ComplaintTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userPhone: string;
  rideId?: string;
  subject: string;
  category: 'driver_behavior' | 'fare_dispute' | 'safety' | 'lost_item' | 'app_issue' | 'cancellation_fee' | 'other';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminResponse?: string;
  aiSummary?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minimumFare: number;
  maximumDiscount: number;
  expiryDate: string;
  active: boolean;
  usageCount: number;
}

export interface PlatformSettings {
  appName: string;
  supportPhone: string;
  supportEmail: string;
  emergencySosNumber: string;
  commissionRatePercent: number; // e.g. 15 for 15%
  surgePricingEnabled: boolean;
  surgeMultiplier: number;
  nightChargeMultiplier: number;
  waitingChargePerMin: number;
  fares: Record<VehicleType, VehicleRateConfig>;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ride' | 'payment' | 'system' | 'promo' | 'driver_approved' | 'emergency';
  read: boolean;
  rideId?: string;
  createdAt: string;
}
