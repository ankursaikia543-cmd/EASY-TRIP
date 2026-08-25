import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, DriverProfile } from '../types';
import { INITIAL_USERS, INITIAL_DRIVERS } from '../utils/initialData';
import { isFirebaseConfigured, auth } from '../firebase/config';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { SupabaseService } from '../supabase/supabaseService';

interface AuthContextType {
  user: UserProfile | null;
  driverProfile: DriverProfile | null;
  currentRole: UserRole | 'guest';
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAs: (role: UserRole, email?: string, name?: string) => Promise<void>;
  loginAsRole: (role: UserRole) => void;
  register: (name: string, email: string, phone: string, role: UserRole, driverData?: Partial<DriverProfile>) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateDriverProfile: (updates: Partial<DriverProfile>) => void;
  adminApproveDriver: (driverId: string) => void;
  adminRejectDriver: (driverId: string, reason?: string) => void;
  adminToggleDriverActive: (driverId: string, active: boolean) => void;
  adminDeleteDriver: (driverId: string) => void;
  adminDeleteUser: (userId: string) => void;
  payDriverAdminFee: (driverId: string, amount: number, upiTxnId: string, method?: string, bookingCount?: number) => void;
  adminToggleDriverFeeStatus: (driverId: string, isPaid: boolean, dueAmount?: number) => void;
  resetUserPassword: (phone: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  topUpWallet: (amount: number) => void;
  allDrivers: DriverProfile[];
  allUsers: UserProfile[];
  // Single Slot Admin Management
  isAdminSlotClaimed: boolean;
  masterAdminAccount: UserProfile | null;
  claimSingleAdminSlot: (name: string, email: string, phone: string, pin: string) => Promise<void>;
  loginAdmin: (identifier: string, pin: string) => Promise<void>;
  resetAdminSlot: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('easytrip_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [allDrivers, setAllDrivers] = useState<DriverProfile[]>(() => {
    const saved = localStorage.getItem('easytrip_all_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('easytrip_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default to Customer for instant interactive demo
  });

  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(() => {
    const saved = localStorage.getItem('easytrip_current_driver');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS[0];
  });

  // Single Slot Admin Account Management
  const [isAdminSlotClaimed, setIsAdminSlotClaimed] = useState<boolean>(() => {
    const saved = localStorage.getItem('easytrip_admin_slot_claimed');
    if (saved !== null) return saved === 'true';
    return true; // Default claimed by Bijay Saikia initially
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('easytrip_admin_pin') || '54321';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Derived master admin account from allUsers
  const masterAdminAccount = allUsers.find(u => u.role === 'admin') || null;

  useEffect(() => {
    localStorage.setItem('easytrip_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('easytrip_all_drivers', JSON.stringify(allDrivers));
  }, [allDrivers]);

  useEffect(() => {
    localStorage.setItem('easytrip_admin_slot_claimed', isAdminSlotClaimed ? 'true' : 'false');
  }, [isAdminSlotClaimed]);

  useEffect(() => {
    localStorage.setItem('easytrip_admin_pin', adminPin);
  }, [adminPin]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('easytrip_current_user', JSON.stringify(user));
      // Sync user login / profile state to Supabase
      SupabaseService.syncUserLogin(user);

      if (user.role === 'driver') {
        const found = allDrivers.find(d => d.userId === user.id);
        if (found) {
          setDriverProfile(found);
          localStorage.setItem('easytrip_current_driver', JSON.stringify(found));
          SupabaseService.syncDriver(found);
        }
      }
    } else {
      localStorage.removeItem('easytrip_current_user');
      localStorage.removeItem('easytrip_current_driver');
      setDriverProfile(null);
    }
  }, [user, allDrivers]);

  // Firebase Auth listener if active
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && fbUser.email) {
          const match = allUsers.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());
          if (match) {
            setUser(match);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [allUsers]);

  const loginAs = async (role: UserRole, email?: string, name?: string) => {
    setIsLoading(true);
    try {
      let targetUser = allUsers.find(u => u.role === role);
      if (email) {
        const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (found) targetUser = found;
      }

      if (!targetUser) {
        // Create new user with the exact name provided
        const finalName = name && name.trim() ? name.trim() : (role === 'admin' ? 'EASY TRIP Admin' : role === 'driver' ? 'Driver Partner' : 'Customer');
        const newUser: UserProfile = {
          id: `user-${role}-${Date.now()}`,
          name: finalName,
          email: email || `${role}@easytrip.in`,
          phone: '+91 98765 00000',
          role,
          status: 'active',
          walletBalance: role === 'customer' ? 300 : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setAllUsers(prev => [...prev, newUser]);
        targetUser = newUser;
      } else if (name && name.trim() && targetUser.name !== name.trim()) {
        // If user logged in specifying an explicit name, update and personalize their profile name
        const updatedUser: UserProfile = { ...targetUser, name: name.trim(), updatedAt: new Date().toISOString() };
        setAllUsers(prev => prev.map(u => u.id === targetUser!.id ? updatedUser : u));
        targetUser = updatedUser;
      }

      setUser(targetUser);

      if (role === 'driver') {
        let drv = allDrivers.find(d => d.userId === targetUser!.id);
        if (!drv) {
          drv = {
            id: `drv-${Date.now()}`,
            userId: targetUser.id,
            name: targetUser.name,
            phone: targetUser.phone,
            email: targetUser.email,
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            vehicleType: 'cab',
            vehicleBrand: 'Maruti Suzuki',
            vehicleModel: 'Dzire Tour',
            vehicleColor: 'White',
            vehicleNumber: 'AS 05 C 4421',
            licenseNumber: 'AS-0520210012345',
            documents: {
              submittedAt: new Date().toISOString(),
            },
            approvalStatus: 'approved',
            onlineStatus: 'online',
            availabilityStatus: 'available',
            currentLocation: {
              address: 'Bokakhat Main Chariali, NH-37, Assam',
              lat: 26.5925,
              lng: 93.5937,
              city: 'Bokakhat',
            },
            rating: 4.92,
            totalRatingsCount: 24,
            totalRides: 32,
            todayEarnings: 1250,
            totalEarnings: 35400,
            platformCommissionRate: 0.15,
            createdAt: new Date().toISOString(),
          };
          setAllDrivers(prev => [...prev, drv!]);
        } else if (name && name.trim() && drv.name !== name.trim()) {
          drv = { ...drv, name: name.trim() };
          setAllDrivers(prev => prev.map(d => d.id === drv!.id ? drv! : d));
        }
        setDriverProfile(drv);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    driverData?: Partial<DriverProfile>
  ) => {
    setIsLoading(true);
    try {
      // Auto-generate official structured Easy Trip ID
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const generatedUserId = role === 'customer' 
        ? `ET-CUST-${randomSuffix}` 
        : role === 'driver' 
        ? `ET-DRV-${randomSuffix}` 
        : `ET-ADM-${randomSuffix}`;

      const newUser: UserProfile = {
        id: generatedUserId,
        name,
        email,
        phone,
        role,
        status: 'active',
        walletBalance: role === 'customer' ? 200 : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser);

      if (role === 'driver') {
        const generatedDriverId = `DRV-${randomSuffix}`;
        const newDriver: DriverProfile = {
          id: generatedDriverId,
          userId: newUser.id,
          name,
          phone,
          email,
          photoURL: driverData?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          vehicleType: driverData?.vehicleType || 'bike',
          vehicleBrand: driverData?.vehicleBrand || 'Hero',
          vehicleModel: driverData?.vehicleModel || 'Glamour 125',
          vehicleColor: driverData?.vehicleColor || 'Black & Orange',
          vehicleNumber: driverData?.vehicleNumber || 'AS 05 B 1289',
          licenseNumber: driverData?.licenseNumber || 'AS-0520220098712',
          documents: {
            licenseUrl: driverData?.documents?.licenseUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
            rcBookUrl: driverData?.documents?.rcBookUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
            insuranceUrl: driverData?.documents?.insuranceUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=80',
            submittedAt: new Date().toISOString(),
          },
          approvalStatus: 'pending', // Per strict policy: Awaiting Admin Activation
          onlineStatus: 'offline',
          availabilityStatus: 'available',
          currentLocation: {
            address: 'Bokakhat Town, Golaghat District, Assam',
            lat: 26.5925,
            lng: 93.5937,
            city: 'Bokakhat',
          },
          rating: 5.0,
          totalRatingsCount: 0,
          totalRides: 0,
          todayEarnings: 0,
          totalEarnings: 0,
          platformCommissionRate: 0.15,
          isFeePaid: true,
          feeDueAmount: 0,
          createdAt: new Date().toISOString(),
        };

        setAllDrivers(prev => [...prev, newDriver]);
        setDriverProfile(newDriver);
        SupabaseService.syncDriver(newDriver);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('Firebase logout warning', e);
      }
    }
    setUser(null);
    setDriverProfile(null);
  };

  const switchDemoUser = (role: UserRole) => {
    const target = allUsers.find(u => u.role === role);
    if (target) {
      setUser(target);
      if (role === 'driver') {
        const drv = allDrivers.find(d => d.userId === target.id) || allDrivers[0];
        setDriverProfile(drv);
      } else {
        setDriverProfile(null);
      }
    } else {
      loginAs(role);
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updated);
    setAllUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
  };

  const updateDriverProfile = (updates: Partial<DriverProfile>) => {
    if (!driverProfile) return;
    const updated = { ...driverProfile, ...updates };
    setDriverProfile(updated);
    setAllDrivers(prev => prev.map(d => (d.id === driverProfile.id ? updated : d)));
  };

  const topUpWallet = (amount: number) => {
    if (!user) return;
    updateUserProfile({ walletBalance: (user.walletBalance || 0) + amount });
  };

  const loginAsRole = (role: UserRole) => {
    switchDemoUser(role);
  };

  const adminApproveDriver = (driverId: string) => {
    setAllDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const updated: DriverProfile = { ...d, approvalStatus: 'approved' };
        if (driverProfile?.id === driverId) {
          setDriverProfile(updated);
        }
        SupabaseService.syncDriver(updated);
        return updated;
      }
      return d;
    }));
  };

  const adminRejectDriver = (driverId: string, reason?: string) => {
    setAllDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const updated: DriverProfile = { ...d, approvalStatus: 'rejected', rejectionReason: reason };
        if (driverProfile?.id === driverId) {
          setDriverProfile(updated);
        }
        SupabaseService.syncDriver(updated);
        return updated;
      }
      return d;
    }));
  };

  const adminToggleDriverActive = (driverId: string, active: boolean) => {
    setAllDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const updated: DriverProfile = { 
          ...d, 
          approvalStatus: active ? 'approved' : 'rejected',
          onlineStatus: active ? d.onlineStatus : 'offline'
        };
        if (driverProfile?.id === driverId) {
          setDriverProfile(updated);
        }
        SupabaseService.syncDriver(updated);
        return updated;
      }
      return d;
    }));
  };

  const adminDeleteDriver = (driverId: string) => {
    setAllDrivers(prev => prev.filter(d => d.id !== driverId));
    if (driverProfile?.id === driverId) {
      setDriverProfile(null);
    }
  };

  const adminDeleteUser = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    setAllDrivers(prev => prev.filter(d => d.userId !== userId));
    if (user?.id === userId) {
      setUser(null);
      setDriverProfile(null);
    }
  };

  const resetUserPassword = async (phone: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const existing = allUsers.find(u => u.phone.replace(/\D/g, '').endsWith(cleanPhone));
    if (!existing) {
      return { success: false, message: 'No registered user account found with this phone number.' };
    }
    // Update PIN in storage
    localStorage.setItem(`easytrip_user_pin_${cleanPhone}`, newPin);
    return { success: true, message: 'Password/PIN reset successfully! You can now login.' };
  };

  const payDriverAdminFee = (
    driverId: string, 
    amount: number, 
    upiTxnId: string, 
    method: string = 'google_pay_upi', 
    bookingCount: number = 1
  ) => {
    setAllDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const newRecord = {
          id: `fee-${Date.now()}`,
          driverId,
          driverName: d.name,
          driverPhone: d.phone,
          vehicleType: d.vehicleType,
          amount,
          bookingCount,
          upiTransactionId: upiTxnId.trim() || `GPay-UPI-${Math.floor(100000000 + Math.random() * 900000000)}`,
          paymentDate: new Date().toISOString(),
          status: 'verified' as const,
          method: (method as any) || 'google_pay_upi',
        };

        const updated: DriverProfile = {
          ...d,
          isFeePaid: true,
          feeDueAmount: 0,
          lastFeePaidDate: new Date().toISOString(),
          totalFeePaidToAdmin: (d.totalFeePaidToAdmin || 0) + amount,
          feePaymentHistory: [newRecord, ...(d.feePaymentHistory || [])],
        };

        if (driverProfile?.id === driverId) {
          setDriverProfile(updated);
        }
        SupabaseService.syncDriver(updated);
        return updated;
      }
      return d;
    }));
  };

  const adminToggleDriverFeeStatus = (driverId: string, isPaid: boolean, dueAmount: number = 0) => {
    setAllDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const updated: DriverProfile = {
          ...d,
          isFeePaid: isPaid,
          feeDueAmount: isPaid ? 0 : (dueAmount || (d.vehicleType === 'cab' ? 50 : 5)),
          lastFeePaidDate: isPaid ? new Date().toISOString() : d.lastFeePaidDate,
        };
        if (driverProfile?.id === driverId) {
          setDriverProfile(updated);
        }
        SupabaseService.syncDriver(updated);
        return updated;
      }
      return d;
    }));
  };

  // Single Slot Admin Account Registration
  const claimSingleAdminSlot = async (name: string, email: string, phone: string, pin: string) => {
    setIsLoading(true);
    try {
      if (isAdminSlotClaimed && masterAdminAccount) {
        throw new Error('Security Restriction: The single master admin slot is already claimed and locked. No additional admin accounts can be created.');
      }

      const newAdmin: UserProfile = {
        id: `user-admin-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: 'admin',
        status: 'active',
        walletBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Remove any prior admin placeholders and add this official master admin
      const filteredUsers = allUsers.filter(u => u.role !== 'admin');
      const updatedUsers = [newAdmin, ...filteredUsers];

      setAllUsers(updatedUsers);
      setUser(newAdmin);
      setAdminPin(pin);
      setIsAdminSlotClaimed(true);

      // Persist to Supabase
      SupabaseService.syncUserLogin(newAdmin);
    } finally {
      setIsLoading(false);
    }
  };

  // Single Slot Admin Login
  const loginAdmin = async (identifier: string, pin: string) => {
    setIsLoading(true);
    try {
      const cleanIdent = identifier.trim().toLowerCase();
      const admin = allUsers.find(u => 
        u.role === 'admin' && 
        (u.email.toLowerCase() === cleanIdent || u.phone.replace(/\s+/g, '').includes(cleanIdent.replace(/\s+/g, '')))
      ) || masterAdminAccount;

      if (!admin) {
        throw new Error('No Master Admin account found. Please initialize the single admin slot first.');
      }

      // Check PIN against current stored pin or default '54321' / 'admin123'
      if (pin !== adminPin && pin !== '54321' && pin !== 'admin123') {
        throw new Error('Invalid Admin Security PIN / Password. Access Denied.');
      }

      setUser(admin);
      setDriverProfile(null);
      SupabaseService.syncUserLogin(admin);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset admin slot (for re-configuration if needed)
  const resetAdminSlot = () => {
    setIsAdminSlotClaimed(false);
    setAllUsers(prev => prev.filter(u => u.role !== 'admin'));
    if (user?.role === 'admin') {
      setUser(null);
    }
    localStorage.removeItem('easytrip_admin_slot_claimed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        driverProfile,
        currentRole: user ? user.role : 'guest',
        isAuthenticated: !!user,
        isLoading,
        loginAs,
        loginAsRole,
        register,
        logout,
        switchDemoUser,
        updateUserProfile,
        updateDriverProfile,
        adminApproveDriver,
        adminRejectDriver,
        adminToggleDriverActive,
        adminDeleteDriver,
        adminDeleteUser,
        payDriverAdminFee,
        adminToggleDriverFeeStatus,
        resetUserPassword,
        topUpWallet,
        allDrivers,
        allUsers,
        isAdminSlotClaimed,
        masterAdminAccount,
        claimSingleAdminSlot,
        loginAdmin,
        resetAdminSlot,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
