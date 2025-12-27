import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/icon';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

const NOTIFICATION_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T/vRF2AAAAAAD/+xBkAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNFMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZDQD8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNFMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

let notificationId = 0;

class NotificationManager {
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];
  private audioContext: AudioContext | null = null;

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private async playNotificationSound() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (e) {
      console.log('Sound playback not available');
    }
  }

  add(notification: Omit<Notification, 'id'>) {
    const id = `notif-${notificationId++}`;
    const newNotification = { ...notification, id, duration: notification.duration || 5000 };
    
    this.notifications.push(newNotification);
    this.notify();
    this.playNotificationSound();

    setTimeout(() => {
      this.remove(id);
    }, newNotification.duration);

    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }
}

export const notificationManager = new NotificationManager();

export function showNotification(type: Notification['type'], title: string, message: string, duration?: number) {
  return notificationManager.add({ type, title, message, duration });
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return notificationManager.subscribe(setNotifications);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'error': return 'XCircle';
      case 'warning': return 'AlertTriangle';
      case 'info': return 'Info';
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'error': return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case 'info': return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
    }
  };

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-right-full duration-300 ${getColors(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <Icon name={getIcon(notification.type)} className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => notificationManager.remove(notification.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <Icon name="X" className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
