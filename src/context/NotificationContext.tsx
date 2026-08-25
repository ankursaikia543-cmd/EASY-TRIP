import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: AppNotification['type'], rideId?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  activeToast: AppNotification | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('easytrip_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'notif-welcome',
        userId: 'all',
        title: 'Welcome to EASY TRIP!',
        message: 'Your smart, reliable cab & bike booking partner across Golaghat district, Assam.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    localStorage.setItem('easytrip_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'system',
    rideId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'current',
      title,
      message,
      type,
      read: false,
      rideId,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    // Audio cue beep for critical updates
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = type === 'emergency' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(type === 'emergency' ? 880 : 587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Audio autoplay policy fallback
    }

    // Auto dismiss toast after 5s
    setTimeout(() => {
      setActiveToast(prev => (prev?.id === newNotif.id ? null : prev));
    }, 5000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearNotifications,
        activeToast,
        dismissToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
