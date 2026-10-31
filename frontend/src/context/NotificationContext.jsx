import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [browserPermission, setBrowserPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [loading, setLoading] = useState(false);
  const prevUnreadRef = useRef(0);

  // Play subtle web audio notification chime
  const playNotificationSound = useCallback(() => {
    if (!preferences?.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      // Harmonic pleasant alert chime (G5 -> C6)
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [preferences]);

  // Send desktop browser notification
  const sendBrowserNotification = useCallback((title, options = {}) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!preferences?.browserNotificationsEnabled) return;

    try {
      const notif = new Notification(title, {
        body: options.body || '',
        icon: options.icon || '/favicon.ico',
        tag: options.tag || 'devpath-notification',
      });

      if (options.url) {
        notif.onclick = () => {
          window.focus();
          if (window.location.pathname !== options.url) {
            window.location.href = options.url;
          }
          notif.close();
        };
      }
    } catch (err) {
      console.warn('Browser notification error:', err);
    }
  }, [preferences]);

  // Fetch unread count & preferences
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      const newCount = res?.unreadCount ?? res?.data?.data?.unreadCount ?? 0;
      if (newCount > prevUnreadRef.current && prevUnreadRef.current !== 0) {
        playNotificationSound();
      }
      prevUnreadRef.current = newCount;
      setUnreadCount(newCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, [playNotificationSound]);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await notificationService.getPreferences();
      setPreferences(res?.preferences || res?.data?.data || res || null);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  }, []);

  const fetchNotifications = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications(params);
      const data = res?.notifications !== undefined ? res : (res?.data?.data || res);
      setNotifications(data?.notifications || []);
      const count = data?.unreadCount ?? 0;
      setUnreadCount(count);
      prevUnreadRef.current = count;
      return data;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearRead = async () => {
    try {
      await notificationService.clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
    }
  };

  const updatePreferences = async (data) => {
    try {
      const res = await notificationService.updatePreferences(data);
      const updated = res?.preferences || res?.data?.data || res;
      setPreferences(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update preferences:', err);
      throw err;
    }
  };

  // Explicit user action to request browser permission
  const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserPermission('unsupported');
      return 'unsupported';
    }

    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        await updatePreferences({ browserNotificationsEnabled: true });
        sendBrowserNotification('DevPath Notifications Active', {
          body: 'You will receive timely study reminders and streak alerts.',
        });
      } else {
        await updatePreferences({ browserNotificationsEnabled: false });
      }
      return perm;
    } catch (err) {
      console.error('Permission request error:', err);
      return 'denied';
    }
  };

  // Initial load & periodic unread check
  useEffect(() => {
    fetchUnreadCount();
    fetchPreferences();

    // In-app heartbeat check every 30s
    const timer = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(timer);
  }, [fetchUnreadCount, fetchPreferences]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        browserPermission,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearRead,
        updatePreferences,
        requestBrowserPermission,
        sendBrowserNotification,
        playNotificationSound,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
