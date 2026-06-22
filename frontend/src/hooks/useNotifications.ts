import { useState, useEffect, useCallback, useRef } from 'react';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../services/notificationService';
import type { Notification } from '../types';
import { toast } from 'sonner';

const POLL_INTERVAL = 30000;
const SOUND_URL = '/sounds/notification.wav';

let globalWs: WebSocket | null = null;

function getWsUrl(): string {
  const token = localStorage.getItem('access_token') || '';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.DEV ? `${window.location.hostname}:8000` : window.location.host;
  const base = import.meta.env.VITE_WS_URL || `${protocol}//${host}`;
  return `${base}/ws/notifications/?token=${token}`;
}

export default function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const playSound = useCallback(() => {
    try {
      const audio = new Audio(SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      if (!mountedRef.current) return;
      setNotifications(notifs);
      setUnreadCount(count);
      document.title = count > 0 ? `(${count}) StarPay` : 'StarPay';
    } catch {
      // silent fail
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const handleMarkRead = useCallback(async (id: number) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    document.title = 'StarPay';
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

    const interval = setInterval(refresh, POLL_INTERVAL);

    if (!globalWs) {
      try {
        const ws = new WebSocket(getWsUrl());
        ws.onmessage = (event) => {
          try {
            const notif = JSON.parse(event.data);
            if (!mountedRef.current) return;
            setNotifications((prev) => [notif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            document.title = `(${unreadCount + 1}) StarPay`;
            playSound();
            toast(notif.title, {
              description: notif.message,
              duration: 5000,
            });
          } catch {}
        };
        ws.onopen = () => {};
        ws.onerror = () => {
          globalWs = null;
        };
        ws.onclose = () => {
          globalWs = null;
        };
        globalWs = ws;
      } catch {}
    }

    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh, playSound]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkRead,
    markAllAsRead: handleMarkAllRead,
    refresh,
  };
}
