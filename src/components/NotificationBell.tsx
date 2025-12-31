import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userData.id.toString()
        },
        body: JSON.stringify({
          action: 'get_notifications',
          user_id: userData.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userData.id.toString()
        },
        body: JSON.stringify({
          action: 'mark_notification_read',
          notification_id: notificationId
        })
      });

      loadNotifications();
    } catch (error) {
      console.error('Ошибка пометки уведомления:', error);
    }
  };

  const markAllAsRead = async () => {
    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);

    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userData.id.toString()
        },
        body: JSON.stringify({
          action: 'mark_all_notifications_read',
          user_id: userData.id
        })
      });

      loadNotifications();
    } catch (error) {
      console.error('Ошибка пометки всех уведомлений:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match_start':
        return 'PlayCircle';
      case 'tournament_update':
        return 'Trophy';
      case 'team_invitation':
        return 'Users';
      case 'achievement':
        return 'Award';
      default:
        return 'Bell';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} д назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10"
        >
          <Icon name="Bell" className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-[#1a1f2e] border-white/10 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Уведомления</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Прочитать все
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <Icon name="Loader2" className="h-8 w-8 mx-auto mb-2 animate-spin" />
              Загрузка...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Icon name="Bell" className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Нет уведомлений</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-purple-500/10' : ''
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    if (notif.link) {
                      window.location.href = notif.link;
                      setOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${!notif.read ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                      <Icon
                        name={getNotificationIcon(notif.type)}
                        className={`h-4 w-4 ${!notif.read ? 'text-purple-400' : 'text-gray-400'}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-semibold text-sm ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatTime(notif.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
