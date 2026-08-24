import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Ride, 
  VehicleType, 
  LocationPoint, 
  PaymentMethod, 
  ChatMessage, 
  PlatformSettings,
  Coupon,
  ComplaintTicket,
  DriverProfile
} from '../types';
import { 
  DEFAULT_PLATFORM_SETTINGS, 
  INITIAL_RIDES, 
  INITIAL_COUPONS, 
  INITIAL_COMPLAINTS,
  POPULAR_LOCATIONS 
} from '../utils/initialData';
import { FareService } from '../services/fareService';
import { PaymentService } from '../services/paymentService';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { SupabaseService } from '../supabase/supabaseService';
import confetti from 'canvas-confetti';

interface RideContextType {
  activeRide: Ride | null;
  ridesHistory: Ride[];
  allRides: Ride[];
  allDrivers: DriverProfile[];
  platformSettings: PlatformSettings;
  coupons: Coupon[];
  complaints: ComplaintTicket[];
  incomingDriverRequest: Ride | null;
  activeChatMessages: ChatMessage[];
  
  // Actions
  requestRide: (
    pickup: LocationPoint, 
    destination: LocationPoint, 
    vehicleType: VehicleType, 
    couponCode?: string
  ) => Promise<Ride>;
  
  cancelRide: (rideId: string, reason: string) => Promise<void>;
  driverAcceptRide: (rideId: string) => Promise<void>;
  driverRejectRide: (rideId: string) => Promise<void>;
  driverArrivedAtPickup: (rideId: string) => Promise<void>;
  driverStartRideWithOtp: (rideId: string, otp: string) => Promise<{ success: boolean; message: string }>;
  driverCompleteRide: (rideId: string) => Promise<void>;
  
  submitRidePayment: (rideId: string, method: PaymentMethod) => Promise<{ success: boolean; message: string }>;
  submitRideRating: (rideId: string, rating: number, review?: string) => Promise<void>;
  
  sendChatMessage: (text: string) => void;
  submitComplaint: (category: ComplaintTicket['category'], subject: string, description: string, rideId?: string) => Promise<void>;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  toggleCouponActive: (couponId: string) => void;
  toggleCoupon: (couponId: string) => void;
  resolveComplaintTicket: (complaintId: string, adminResponse: string) => void;
  resolveComplaint: (complaintId: string, adminResponse: string) => void;
  resetAllDemoData: () => void;
}

const RideContext = createContext<RideContextType | undefined>(undefined);

export const RideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, driverProfile, allDrivers, updateDriverProfile, updateUserProfile } = useAuth();
  const { addNotification } = useNotifications();

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem('easytrip_settings');
    return saved ? JSON.parse(saved) : DEFAULT_PLATFORM_SETTINGS;
  });

  const [allRides, setAllRides] = useState<Ride[]>(() => {
    const saved = localStorage.getItem('easytrip_rides');
    return saved ? JSON.parse(saved) : INITIAL_RIDES;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('easytrip_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [complaints, setComplaints] = useState<ComplaintTicket[]>(() => {
    const saved = localStorage.getItem('easytrip_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('easytrip_chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [incomingDriverRequest, setIncomingDriverRequest] = useState<Ride | null>(null);

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('easytrip_settings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
    localStorage.setItem('easytrip_rides', JSON.stringify(allRides));
  }, [allRides]);

  useEffect(() => {
    localStorage.setItem('easytrip_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('easytrip_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('easytrip_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Keep activeRide updated when user switches role or views their ongoing ride
  useEffect(() => {
    if (!user) {
      setActiveRide(null);
      return;
    }

    const currentOngoing = allRides.find(r => 
      (r.customerId === user.id || (driverProfile && r.driverId === driverProfile.id)) &&
      (r.status === 'searching' || r.status === 'driver_assigned' || r.status === 'arrived' || r.status === 'in_progress')
    );

    setActiveRide(currentOngoing || null);
  }, [allRides, user, driverProfile]);

  // Simulate driver motion when ride is assigned or in progress
  useEffect(() => {
    if (!activeRide || (activeRide.status !== 'driver_assigned' && activeRide.status !== 'in_progress')) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      return;
    }

    // Step driver coordinates closer to target point
    simulationIntervalRef.current = setInterval(() => {
      setAllRides(prev => prev.map(ride => {
        if (ride.id !== activeRide.id) return ride;

        const target = ride.status === 'driver_assigned' ? ride.pickup : ride.destination;
        const curLat = ride.driverLocation?.lat ?? (ride.pickup.lat - 0.015);
        const curLng = ride.driverLocation?.lng ?? (ride.pickup.lng - 0.012);

        // Smooth delta step towards target
        const deltaLat = (target.lat - curLat) * 0.12;
        const deltaLng = (target.lng - curLng) * 0.12;

        const nextLat = curLat + deltaLat;
        const nextLng = curLng + deltaLng;

        return {
          ...ride,
          driverLocation: {
            lat: nextLat,
            lng: nextLng,
            bearing: Math.atan2(deltaLng, deltaLat) * (180 / Math.PI),
          }
        };
      }));
    }, 2500);

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [activeRide?.id, activeRide?.status]);

  // 1. Customer initiates ride request
  const requestRide = async (
    pickup: LocationPoint,
    destination: LocationPoint,
    vehicleType: VehicleType,
    couponCode?: string
  ): Promise<Ride> => {
    const distanceKm = FareService.calculateDistanceKm(pickup, destination);
    const durationMin = FareService.estimateDurationMin(distanceKm, vehicleType);
    const coupon = couponCode ? coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active) : null;
    
    const fareCalc = FareService.calculateFare(vehicleType, distanceKm, durationMin, platformSettings, coupon);

    // Generate random 4-digit PIN for ride security OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newRide: Ride = {
      id: `ride-${Date.now()}`,
      customerId: user ? user.id : 'guest-cust',
      customerName: user ? user.name : 'Valued Passenger',
      customerPhone: user ? user.phone : '+91 98765 00000',
      customerPhoto: user?.photoURL,
      vehicleType,
      otp: generatedOtp,
      pickup,
      destination,
      distanceKm,
      estimatedDurationMin: durationMin,
      estimatedFare: fareCalc.totalFare,
      finalFare: fareCalc.totalFare,
      fareBreakdown: fareCalc,
      couponCode: fareCalc.couponCode,
      discount: fareCalc.discount,
      surgeMultiplier: fareCalc.surgeMultiplier,
      status: 'searching',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      driverLocation: {
        lat: pickup.lat - 0.012,
        lng: pickup.lng - 0.008,
      },
      createdAt: new Date().toISOString(),
    };

    setAllRides(prev => [newRide, ...prev]);
    setActiveRide(newRide);

    // Save newly requested ride booking to Supabase
    SupabaseService.syncRideBooking(newRide);

    addNotification(
      'Ride Requested!',
      `Searching nearby ${vehicleType.toUpperCase()} drivers for pickup at ${pickup.address.split(',')[0]}...`,
      'ride',
      newRide.id
    );

    // Matching engine: Find approved & available driver of matching type
    const matchedDriver = allDrivers.find(
      d => d.approvalStatus === 'approved' && d.onlineStatus === 'online' && d.vehicleType === vehicleType
    ) || allDrivers.find(d => d.approvalStatus === 'approved') || allDrivers[0];

    // If current logged-in user is a driver with matching criteria, present incoming request modal
    if (driverProfile && driverProfile.approvalStatus === 'approved' && driverProfile.onlineStatus === 'online') {
      setIncomingDriverRequest(newRide);
    }

    // Realistic matching timer: Auto-assign after 4 seconds to ensure interactive feedback
    setTimeout(() => {
      setAllRides(prev => prev.map(r => {
        if (r.id === newRide.id && r.status === 'searching') {
          const assignedDriver = matchedDriver;
          addNotification(
            'Driver Assigned!',
            `${assignedDriver.name} (${assignedDriver.vehicleNumber}) accepted your ride and is on the way.`,
            'ride',
            newRide.id
          );

          const updated: Ride = {
            ...r,
            status: 'driver_assigned',
            driverId: assignedDriver.id,
            driverName: assignedDriver.name,
            driverPhone: assignedDriver.phone,
            driverPhoto: assignedDriver.photoURL,
            driverRating: assignedDriver.rating,
            vehicleBrand: assignedDriver.vehicleBrand,
            vehicleModel: assignedDriver.vehicleModel,
            vehicleColor: assignedDriver.vehicleColor,
            vehicleNumber: assignedDriver.vehicleNumber,
            acceptedAt: new Date().toISOString(),
          };

          SupabaseService.syncRideBooking(updated);
          return updated;
        }
        return r;
      }));
    }, 4500);

    return newRide;
  };

  // 2. Driver actions
  const driverAcceptRide = async (rideId: string) => {
    if (!driverProfile) return;
    setIncomingDriverRequest(null);

    setAllRides(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated: Ride = {
          ...r,
          status: 'driver_assigned',
          driverId: driverProfile.id,
          driverName: driverProfile.name,
          driverPhone: driverProfile.phone,
          driverPhoto: driverProfile.photoURL,
          driverRating: driverProfile.rating,
          vehicleBrand: driverProfile.vehicleBrand,
          vehicleModel: driverProfile.vehicleModel,
          vehicleColor: driverProfile.vehicleColor,
          vehicleNumber: driverProfile.vehicleNumber,
          acceptedAt: new Date().toISOString(),
        };
        SupabaseService.syncRideBooking(updated);
        return updated;
      }
      return r;
    }));

    updateDriverProfile({ availabilityStatus: 'busy' });
    addNotification('Ride Accepted', 'Navigate to customer pickup location.', 'ride', rideId);
  };

  const driverRejectRide = async (rideId: string) => {
    setIncomingDriverRequest(null);
    addNotification('Request Declined', 'Looking for other available rides in your zone.', 'system');
  };

  const driverArrivedAtPickup = async (rideId: string) => {
    setAllRides(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated: Ride = { ...r, status: 'arrived', arrivedAt: new Date().toISOString() };
        SupabaseService.syncRideBooking(updated);
        return updated;
      }
      return r;
    }));

    addNotification('Driver Arrived!', 'Your driver is waiting at the pickup point.', 'ride', rideId);
  };

  const driverStartRideWithOtp = async (rideId: string, inputOtp: string) => {
    const target = allRides.find(r => r.id === rideId);
    if (!target) return { success: false, message: 'Ride not found.' };

    if (inputOtp.trim() !== target.otp) {
      return { success: false, message: 'Invalid OTP PIN! Please ask passenger for the 4-digit PIN.' };
    }

    setAllRides(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated: Ride = { ...r, status: 'in_progress', startedAt: new Date().toISOString() };
        SupabaseService.syncRideBooking(updated);
        return updated;
      }
      return r;
    }));

    addNotification('Trip Started', 'Follow navigation route to drop-off point.', 'ride', rideId);
    return { success: true, message: 'OTP verified! Trip started successfully.' };
  };

  const driverCompleteRide = async (rideId: string) => {
    setAllRides(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated: Ride = { ...r, status: 'completed', completedAt: new Date().toISOString() };
        SupabaseService.syncRideBooking(updated);
        return updated;
      }
      return r;
    }));

    if (driverProfile) {
      const ride = allRides.find(r => r.id === rideId);
      const grossFare = ride?.finalFare || 150;
      const commission = grossFare * (platformSettings.commissionRatePercent / 100);
      const net = grossFare - commission;

      const updatedDriver = {
        ...driverProfile,
        availabilityStatus: 'available' as const,
        totalRides: (driverProfile.totalRides || 0) + 1,
        todayEarnings: (driverProfile.todayEarnings || 0) + net,
        totalEarnings: (driverProfile.totalEarnings || 0) + net,
      };

      updateDriverProfile(updatedDriver);
      SupabaseService.syncDriver(updatedDriver);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    addNotification('Trip Completed!', 'Please collect payment and rate passenger.', 'ride', rideId);
  };

  // 3. Customer actions
  const cancelRide = async (rideId: string, reason: string) => {
    setAllRides(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated: Ride = {
          ...r,
          status: 'cancelled',
          cancellationReason: reason,
          cancelledBy: user?.role === 'driver' ? 'driver' : 'customer',
          cancelledAt: new Date().toISOString(),
        };
        SupabaseService.syncRideBooking(updated);
        return updated;
      }
      return r;
    }));

    if (driverProfile) {
      updateDriverProfile({ availabilityStatus: 'available' });
    }

    addNotification('Ride Cancelled', `Ride ${rideId.substring(0, 8)} was cancelled. Reason: ${reason}`, 'ride', rideId);
  };

  const submitRidePayment = async (rideId: string, method: PaymentMethod) => {
    const ride = allRides.find(r => r.id === rideId);
    if (!ride) return { success: false, message: 'Ride not found' };

    if (method === 'wallet' && user) {
      if ((user.walletBalance || 0) < ride.finalFare) {
        return { 
          success: false, 
          message: `Insufficient wallet balance (₹${user.walletBalance || 0}). Please top-up or choose UPI/Cash.` 
        };
      }
      updateUserProfile({ walletBalance: (user.walletBalance || 0) - ride.finalFare });
    }

    const payRecord = await PaymentService.createPayment({
      rideId,
      customerId: ride.customerId,
      driverId: ride.driverId || 'drv-1',
      amount: ride.finalFare,
      paymentMethod: method,
    });

    // Sync Payment record to Supabase
    SupabaseService.syncPaymentRecord(payRecord);

    setAllRides(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated: Ride = {
          ...r,
          paymentMethod: method,
          paymentStatus: 'paid',
          transactionId: payRecord.transactionId,
        };
        // Update ride booking payment status in Supabase
        SupabaseService.syncRideBooking(updated);
        return updated;
      }
      return r;
    }));

    addNotification('Payment Confirmed', `₹${ride.finalFare} paid via ${method.toUpperCase()}. Thank you for riding EASY TRIP!`, 'payment', rideId);
    return { success: true, message: 'Payment recorded successfully.' };
  };

  const submitRideRating = async (rideId: string, rating: number, review?: string) => {
    setAllRides(prev => prev.map(r => {
      if (r.id === rideId) {
        const updated: Ride = { ...r, rating, review };
        SupabaseService.syncRideBooking(updated);
        return updated;
      }
      return r;
    }));

    // Recalculate driver rating
    const targetRide = allRides.find(r => r.id === rideId);
    if (targetRide?.driverId) {
      const driverObj = allDrivers.find(d => d.id === targetRide.driverId);
      if (driverObj) {
        const curTotal = (driverObj.rating || 4.8) * (driverObj.totalRatingsCount || 20);
        const newCount = (driverObj.totalRatingsCount || 20) + 1;
        const newAvg = Math.round(((curTotal + rating) / newCount) * 100) / 100;
        
        const updatedDriver: DriverProfile = {
          ...driverObj,
          rating: newAvg,
          totalRatingsCount: newCount,
        };
        updateDriverProfile(updatedDriver);
        SupabaseService.syncDriver(updatedDriver);
      }
    }

    addNotification('Feedback Submitted', 'Thank you for helping us maintain 5-star trip quality!', 'system');
  };

  // Chat
  const sendChatMessage = (text: string) => {
    if (!activeRide || !user) return;
    const msg: ChatMessage = {
      id: `chat-${Date.now()}`,
      rideId: activeRide.id,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, msg]);
  };

  // Support complaint
  const submitComplaint = async (category: ComplaintTicket['category'], subject: string, description: string, rideId?: string) => {
    const newComp: ComplaintTicket = {
      id: `comp-${Date.now()}`,
      userId: user ? user.id : 'guest',
      userName: user ? user.name : 'Anonymous',
      userRole: user ? user.role : 'customer',
      userPhone: user ? user.phone : '+91 98765 43210',
      rideId: rideId || activeRide?.id,
      category,
      subject,
      description,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    setComplaints(prev => [newComp, ...prev]);
    // Sync grievance to Supabase
    SupabaseService.syncComplaint(newComp);
    addNotification('Ticket Registered', 'Your support grievance has been logged. Support team will respond shortly.', 'system');
  };

  const resolveComplaintTicket = (complaintId: string, adminResponse: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          status: 'resolved',
          adminResponse,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    }));
    addNotification('Ticket Resolved', `Complaint ${complaintId} marked resolved.`, 'system');
  };

  const updatePlatformSettings = (newSettings: Partial<PlatformSettings>) => {
    setPlatformSettings(prev => ({ ...prev, ...newSettings }));
    addNotification('Settings Updated', 'Platform fare rates and surge parameters refreshed.', 'system');
  };

  const addCoupon = (newCoup: Omit<Coupon, 'id' | 'usageCount'>) => {
    const created: Coupon = {
      ...newCoup,
      id: `coup-${Date.now()}`,
      usageCount: 0,
    };
    setCoupons(prev => [created, ...prev]);
    addNotification('Coupon Created', `Promo code ${created.code} is now live!`, 'promo');
  };

  const toggleCouponActive = (couponId: string) => {
    setCoupons(prev => prev.map(c => (c.id === couponId ? { ...c, active: !c.active } : c)));
  };

  const createCoupon = (newCoup: Omit<Coupon, 'id' | 'usageCount'>) => {
    addCoupon(newCoup);
  };

  const toggleCoupon = (couponId: string) => {
    toggleCouponActive(couponId);
  };

  const resolveComplaint = (complaintId: string, adminResponse: string) => {
    resolveComplaintTicket(complaintId, adminResponse);
  };

  const resetAllDemoData = () => {
    localStorage.removeItem('easytrip_settings');
    localStorage.removeItem('easytrip_rides');
    localStorage.removeItem('easytrip_coupons');
    localStorage.removeItem('easytrip_complaints');
    localStorage.removeItem('easytrip_chats');
    localStorage.removeItem('easytrip_notifications');
    localStorage.removeItem('easytrip_all_users');
    localStorage.removeItem('easytrip_all_drivers');
    localStorage.removeItem('easytrip_current_user');
    localStorage.removeItem('easytrip_current_driver');
    setPlatformSettings(DEFAULT_PLATFORM_SETTINGS);
    setAllRides(INITIAL_RIDES);
    setCoupons(INITIAL_COUPONS);
    setComplaints(INITIAL_COMPLAINTS);
    setChatMessages([]);
    setActiveRide(null);
    setIncomingDriverRequest(null);
  };

  const activeChatMessages = activeRide ? chatMessages.filter(m => m.rideId === activeRide.id) : [];
  const ridesHistory = user ? allRides.filter(r => r.customerId === user.id || (driverProfile && r.driverId === driverProfile.id)) : allRides;

  return (
    <RideContext.Provider
      value={{
        activeRide,
        ridesHistory,
        allRides,
        allDrivers,
        platformSettings,
        coupons,
        complaints,
        incomingDriverRequest,
        activeChatMessages,
        requestRide,
        cancelRide,
        driverAcceptRide,
        driverRejectRide,
        driverArrivedAtPickup,
        driverStartRideWithOtp,
        driverCompleteRide,
        submitRidePayment,
        submitRideRating,
        sendChatMessage,
        submitComplaint,
        updatePlatformSettings,
        addCoupon,
        createCoupon,
        toggleCouponActive,
        toggleCoupon,
        resolveComplaintTicket,
        resolveComplaint,
        resetAllDemoData,
      }}
    >
      {children}
    </RideContext.Provider>
  );
};

export const useRide = (): RideContextType => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};
