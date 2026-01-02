import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
  is_referee: boolean;
}

interface Referee {
  id: number;
  nickname: string;
  avatar_url: string | null;
}

interface MatchDetailsChatProps {
  messages: ChatMessage[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  canChat: boolean;
  referee: Referee | null;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes}м назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}ч назад`;
  return date.toLocaleDateString('ru-RU');
};

export default function MatchDetailsChat({
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  canChat,
  referee
}: MatchDetailsChatProps) {
  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-white/10 flex flex-col h-[800px]">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">Чат матча</h3>
        {referee && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <Icon name="Shield" className="h-4 w-4 text-purple-400" />
            <span>Судья: {referee.nickname}</span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div className="flex-shrink-0">
                {msg.avatar_url ? (
                  <img
                    src={msg.avatar_url}
                    alt={msg.username}
                    className="w-8 h-8 rounded-full border border-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
                    {msg.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{msg.username}</span>
                  {msg.is_referee && (
                    <Icon name="Shield" className="h-3 w-3 text-purple-400" />
                  )}
                  <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                </div>
                <p className="text-sm text-gray-300 mt-1 break-words">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {canChat ? (
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Напишите сообщение..."
              className="bg-[#0a0e1a] border-white/10 text-white"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Icon name="Send" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-white/10 text-center text-sm text-gray-400">
          Только участники матча и судья могут писать в чат
        </div>
      )}
    </div>
  );
}
