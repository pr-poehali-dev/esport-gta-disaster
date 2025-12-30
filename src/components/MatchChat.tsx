import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface ChatMessage {
  id: number;
  message: string;
  type: string;
  created_at: string;
  user: {
    id: number;
    nickname: string;
    avatar_url: string | null;
  } | null;
}

interface MatchChatProps {
  matchId: string;
}

export default function MatchChat({ matchId }: MatchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadMessages();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : '';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'get_match_chat',
          match_id: matchId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error: any) {
      console.error('Error loading chat:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const sessionToken = localStorage.getItem('sessionToken');
    if (!sessionToken) {
      showNotification('error', 'Ошибка', 'Требуется авторизация');
      return;
    }

    setLoading(true);

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : '';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'send_chat_message',
          match_id: matchId,
          message: newMessage,
          message_type: 'message'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage('');
        loadMessages();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="p-4 flex flex-col h-[500px]">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Icon name="MessageCircle" className="h-5 w-5" />
        Чат матча
      </h3>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`${msg.type === 'system' ? 'text-center' : ''}`}>
            {msg.type === 'system' ? (
              <div className="py-2 px-3 rounded bg-yellow-500/10 text-yellow-500 text-sm">
                <Icon name="Info" className="h-4 w-4 inline mr-2" />
                {msg.message}
              </div>
            ) : (
              <div className="flex gap-3">
                {msg.user?.avatar_url ? (
                  <img 
                    src={msg.user.avatar_url} 
                    alt={msg.user.nickname} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="User" className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{msg.user?.nickname || 'Система'}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Написать сообщение..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !newMessage.trim()}>
          <Icon name="Send" className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}