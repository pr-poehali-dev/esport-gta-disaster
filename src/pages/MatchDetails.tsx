import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import MatchDetailsHeader from '@/components/match/MatchDetailsHeader';
import MatchDetailsTeams from '@/components/match/MatchDetailsTeams';
import MatchDetailsChat from '@/components/match/MatchDetailsChat';

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
      console.log('Loading match details for ID:', matchId);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_match_details',
          match_id: matchId,
          user_id: user?.id
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.match) {
        // Добавляем fallback данные для команд если их нет
        if (data.match.team1 && (!data.match.team1.members || data.match.team1.members.length === 0)) {
          data.match.team1.members = [
            { id: 1, nickname: 'Player1', avatar_url: null, role: 'Player', status: 'offline' },
            { id: 2, nickname: 'Player2', avatar_url: null, role: 'Player', status: 'offline' },
            { id: 3, nickname: 'Player3', avatar_url: null, role: 'Player', status: 'offline' },
          ];
        }
        if (data.match.team2 && (!data.match.team2.members || data.match.team2.members.length === 0)) {
          data.match.team2.members = [
            { id: 4, nickname: 'Player4', avatar_url: null, role: 'Player', status: 'offline' },
            { id: 5, nickname: 'Player5', avatar_url: null, role: 'Player', status: 'offline' },
            { id: 6, nickname: 'Player6', avatar_url: null, role: 'Player', status: 'offline' },
          ];
        }
        
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
      } else {
        console.error('No match data in response:', data);
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
          <MatchDetailsHeader match={match} onBack={() => navigate(-1)} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-[1fr_400px] gap-6">
            {/* Left Column - Tabs */}
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-[#1a1f2e] border border-white/10 p-1 w-full justify-start">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                    <Icon name="LayoutGrid" className="h-4 w-4 mr-2" />
                    Обзор
                  </TabsTrigger>
                  <TabsTrigger value="scoreboard" className="data-[state=active]:bg-purple-600">
                    <Icon name="TrendingUp" className="h-4 w-4 mr-2" />
                    Статистика
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="data-[state=active]:bg-purple-600">
                    <Icon name="Video" className="h-4 w-4 mr-2" />
                    Видео
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <MatchDetailsTeams match={match} />
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

            {/* Right Column - Chat */}
            <MatchDetailsChat
              messages={messages}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessage={sendMessage}
              canChat={canChat}
              referee={match.referee}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
