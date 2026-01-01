import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Player {
  id: number;
  nickname: string;
  avatar_url: string | null;
  role: string;
  status: 'online' | 'offline' | 'away';
}

interface Team {
  id: number;
  name: string;
  logo_url: string | null;
  captain_id: number;
  members: Player[];
}

interface MapScore {
  map_name: string;
  team1_score: number;
  team2_score: number;
}

interface Match {
  id: number;
  round: number;
  team1: Team;
  team2: Team;
  team1_score: number;
  team2_score: number;
  winner_id: number | null;
  status: string;
  scheduled_at: string | null;
  tournament_name: string;
  map_scores: MapScore[];
  referee: {
    id: number;
    nickname: string;
    avatar_url: string | null;
  } | null;
}

interface ChatMessage {
  id: number;
  user_id: number;
  username: string;
  avatar_url: string | null;
  message: string;
  created_at: string;
  is_referee: boolean;
}

export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadMatchDetails();
    loadChatMessages();
  }, [matchId]);

  const loadMatchDetails = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_match_details',
          match_id: matchId,
          user_id: user?.id
        })
      });

      const data = await response.json();
      if (data.match) {
        // Добавляем mock данные для карт если их нет
        if (!data.match.map_scores || data.match.map_scores.length === 0) {
          data.match.map_scores = [
            {
              map_name: 'de_dust2',
              team1_score: data.match.team1_score > 0 ? Math.floor(Math.random() * 16) : 0,
              team2_score: data.match.team2_score > 0 ? Math.floor(Math.random() * 16) : 0
            }
          ];
        }
        setMatch(data.match);
      }
    } catch (error) {
      console.error('Ошибка загрузки матча:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_match_chat',
          match_id: matchId
        })
      });

      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Ошибка загрузки чата:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'send_chat_message',
          match_id: matchId,
          message: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        loadChatMessages();
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Матч не найден</h2>
            <Button onClick={() => navigate('/tournaments')}>
              <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Назад к турнирам
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isReferee = user && match.referee && user.id === match.referee.id;
  const isParticipant = user && (
    match.team1.members.some(m => m.id === user.id) ||
    match.team2.members.some(m => m.id === user.id)
  );
  const canChat = isReferee || isParticipant;

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="max-w-[1800px] mx-auto px-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#1a1f2e] via-[#1e2230] to-[#1a1f2e] rounded-xl border border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white"
              >
                <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <Button variant="outline" className="border-white/10 text-gray-400">
                <Icon name="Share2" className="h-4 w-4 mr-2" />
                SHARE
              </Button>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
              {/* Team 1 */}
              <div className="flex items-center justify-end gap-4">
                <div className="text-right">
                  <h2 className="text-3xl font-bold text-white mb-1">{match.team1.name}</h2>
                  <p className="text-gray-400">BO3</p>
                </div>
                {match.team1.logo_url && (
                  <img
                    src={match.team1.logo_url}
                    alt={match.team1.name}
                    className="w-20 h-20 rounded-lg border-2 border-white/10"
                  />
                )}
              </div>

              {/* Score */}
              <div className="text-center px-8">
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-white bg-[#0a0e1a] px-6 py-3 rounded-lg">
                    {match.team1_score}
                  </div>
                  <div className="text-2xl text-gray-500">—</div>
                  <div className="text-5xl font-black text-white bg-[#0a0e1a] px-6 py-3 rounded-lg">
                    {match.team2_score}
                  </div>
                </div>
                {match.status !== 'completed' && match.scheduled_at && (
                  <div className="mt-4 bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-2">
                    <p className="text-orange-400 font-semibold">TIME TO CONNECT</p>
                    <p className="text-2xl font-bold text-orange-300">04:29</p>
                  </div>
                )}
              </div>

              {/* Team 2 */}
              <div className="flex items-center gap-4">
                {match.team2.logo_url && (
                  <img
                    src={match.team2.logo_url}
                    alt={match.team2.name}
                    className="w-20 h-20 rounded-lg border-2 border-white/10"
                  />
                )}
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{match.team2.name}</h2>
                  <p className="text-gray-400">BO3</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_400px] gap-6">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-[#1a1f2e] border border-white/10 p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-[#0a0e1a]">
                    OVERVIEW
                  </TabsTrigger>
                  <TabsTrigger value="scoreboard" className="data-[state=active]:bg-[#0a0e1a]">
                    SCOREBOARD
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="data-[state=active]:bg-[#0a0e1a]">
                    VIDEOS
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Map Scores */}
                  {match.map_scores && match.map_scores.length > 0 && (
                    <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Карты</h3>
                      <div className="space-y-3">
                        {match.map_scores.map((mapScore, index) => (
                          <div
                            key={index}
                            className="bg-[#0a0e1a] rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{mapScore.map_name}</p>
                                <p className="text-sm text-gray-400">Best of 1</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-2xl font-bold">
                              <span className={mapScore.team1_score > mapScore.team2_score ? 'text-green-400' : 'text-white'}>
                                {mapScore.team1_score}
                              </span>
                              <span className="text-gray-600">:</span>
                              <span className={mapScore.team2_score > mapScore.team1_score ? 'text-green-400' : 'text-white'}>
                                {mapScore.team2_score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Team Rosters */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Team 1 Players */}
                    <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">{match.team1.name}</h3>
                      <div className="space-y-2">
                        {match.team1.members.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-3 p-3 bg-[#0a0e1a] rounded-lg hover:bg-[#12161f] transition-colors cursor-pointer"
                          >
                            <div className="relative">
                              {player.avatar_url ? (
                                <img
                                  src={player.avatar_url}
                                  alt={player.nickname}
                                  className="w-10 h-10 rounded-full border-2 border-white/10"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                  {player.nickname[0].toUpperCase()}
                                </div>
                              )}
                              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0e1a] ${getStatusColor(player.status)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{player.nickname}</p>
                              <p className="text-xs text-gray-400">{player.role}</p>
                            </div>
                            {player.id === match.team1.captain_id && (
                              <Icon name="Crown" className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team 2 Players */}
                    <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6">
                      <h3 className="text-lg font-bold text-white mb-4">{match.team2.name}</h3>
                      <div className="space-y-2">
                        {match.team2.members.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-3 p-3 bg-[#0a0e1a] rounded-lg hover:bg-[#12161f] transition-colors cursor-pointer"
                          >
                            <div className="relative">
                              {player.avatar_url ? (
                                <img
                                  src={player.avatar_url}
                                  alt={player.nickname}
                                  className="w-10 h-10 rounded-full border-2 border-white/10"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                                  {player.nickname[0].toUpperCase()}
                                </div>
                              )}
                              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0e1a] ${getStatusColor(player.status)}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white truncate">{player.nickname}</p>
                              <p className="text-xs text-gray-400">{player.role}</p>
                            </div>
                            {player.id === match.team2.captain_id && (
                              <Icon name="Crown" className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="scoreboard" className="mt-6">
                  <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6">
                    <p className="text-center text-gray-400 py-8">Детальная статистика будет доступна после завершения матча</p>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="mt-6">
                  <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6">
                    <p className="text-center text-gray-400 py-8">Видео записи матча пока отсутствуют</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Chat Sidebar */}
            <div className="bg-[#1a1f2e] rounded-xl border border-white/10 flex flex-col h-[800px]">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Чат матча</h3>
                {match.referee && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <Icon name="Shield" className="h-4 w-4 text-purple-400" />
                    <span>Судья: {match.referee.nickname}</span>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}