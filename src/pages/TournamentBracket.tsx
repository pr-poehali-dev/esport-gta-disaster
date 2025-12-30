import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Match {
  id: number;
  round: number;
  match_number: number;
  team1: { id: number; name: string; logo_url?: string } | null;
  team2: { id: number; name: string; logo_url?: string } | null;
  winner_id: number | null;
  score_team1: number;
  score_team2: number;
  map_name: string | null;
  scheduled_at: string | null;
  status: string;
}

export default function TournamentBracket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [format, setFormat] = useState<string>('single-elimination');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
    loadBracket();
  }, [id]);

  const canEdit = ['founder', 'admin', 'moderator', 'organizer'].includes(userRole);

  const loadBracket = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id || '1'
        },
        body: JSON.stringify({
          action: 'get_bracket',
          tournament_id: id
        })
      });

      const data = await response.json();
      
      if (data.matches) {
        const formattedMatches = data.matches.map((m: any) => ({
          id: m.id,
          round: m.round,
          match_number: m.match_number,
          team1: m.team1_id ? { 
            id: m.team1_id, 
            name: m.team1_name || 'TBD',
            logo_url: m.team1_logo_url 
          } : null,
          team2: m.team2_id ? { 
            id: m.team2_id, 
            name: m.team2_name || 'TBD',
            logo_url: m.team2_logo_url 
          } : null,
          winner_id: m.winner_id,
          score_team1: m.team1_score || 0,
          score_team2: m.team2_score || 0,
          map_name: m.map_name,
          scheduled_at: m.scheduled_at,
          status: m.status
        }));
        setMatches(formattedMatches);
        setFormat(data.format || 'single-elimination');
      }
    } catch (error) {
      console.error('Ошибка загрузки сетки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить турнирную сетку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMatch = async (matchId: number, score1: number, score2: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id
        },
        body: JSON.stringify({
          action: 'update_match_score',
          match_id: matchId,
          team1_score: score1,
          team2_score: score2
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Счет матча обновлен'
        });
        setEditMatch(null);
        loadBracket();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить счет',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить счет матча',
        variant: 'destructive'
      });
    }
  };

  const completeMatch = async (matchId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id
        },
        body: JSON.stringify({
          action: 'complete_match',
          match_id: matchId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Матч завершен, победитель продвинут'
        });
        loadBracket();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось завершить матч',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить матч',
        variant: 'destructive'
      });
    }
  };



  const renderMatch = (match: Match) => (
    <div key={match.id} className="relative group">
      {canEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/90"
          onClick={(e) => {
            e.stopPropagation();
            setEditMatch(match);
          }}
        >
          <Icon name="Edit" className="h-4 w-4" />
        </Button>
      )}
      
      <div 
        className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-sm rounded-xl border-2 border-purple-500/30 p-4 cursor-pointer hover:border-purple-400/60 transition-all hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 hover:-translate-y-1"
        onClick={() => navigate(`/matches/${match.id}`)}
      >
        <div className="space-y-2">
          <div 
            className={`flex items-center justify-between p-3 rounded-lg backdrop-blur-md ${
              match.winner_id === match.team1?.id 
                ? 'bg-purple-500/30 border-2 border-purple-400' 
                : 'bg-black/30 border border-purple-500/20'
            } transition-all`}
          >
            <div className="flex items-center gap-3 flex-1">
              {match.team1?.logo_url && (
                <img src={match.team1.logo_url} alt="" className="w-8 h-8 rounded-full border-2 border-purple-400/50" />
              )}
              <span className={`font-bold text-sm ${
                match.winner_id === match.team1?.id ? 'text-purple-200' : 'text-gray-300'
              }`}>
                {match.team1?.name || 'TBD'}
              </span>
            </div>
            <span className="text-xl font-black text-purple-100 min-w-[40px] text-right">
              {match.score_team1}
            </span>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
          </div>

          <div 
            className={`flex items-center justify-between p-3 rounded-lg backdrop-blur-md ${
              match.winner_id === match.team2?.id 
                ? 'bg-purple-500/30 border-2 border-purple-400' 
                : 'bg-black/30 border border-purple-500/20'
            } transition-all`}
          >
            <div className="flex items-center gap-3 flex-1">
              {match.team2?.logo_url && (
                <img src={match.team2.logo_url} alt="" className="w-8 h-8 rounded-full border-2 border-purple-400/50" />
              )}
              <span className={`font-bold text-sm ${
                match.winner_id === match.team2?.id ? 'text-purple-200' : 'text-gray-300'
              }`}>
                {match.team2?.name || 'TBD'}
              </span>
            </div>
            <span className="text-xl font-black text-purple-100 min-w-[40px] text-right">
              {match.score_team2}
            </span>
          </div>
        </div>

        {(match.map_name || match.scheduled_at) && (
          <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-1">
            {match.map_name && (
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <Icon name="Map" className="h-3 w-3" />
                <span>{match.map_name}</span>
              </div>
            )}
            {match.scheduled_at && (
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <Icon name="Calendar" className="h-3 w-3" />
                <span>{new Date(match.scheduled_at).toLocaleString('ru-RU')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const groupByRound = (matches: Match[]) => {
    const rounds: { [key: number]: Match[] } = {};
    matches.forEach(match => {
      if (!rounds[match.round]) rounds[match.round] = [];
      rounds[match.round].push(match);
    });
    return rounds;
  };

  const getRoundName = (round: number, totalRounds: number) => {
    const roundsLeft = totalRounds - round + 1;
    if (roundsLeft === 1) return 'ФИНАЛ';
    if (roundsLeft === 2) return 'ПОЛУФИНАЛ';
    if (roundsLeft === 3) return 'ЧЕТВЕРТЬФИНАЛ';
    return `1/${Math.pow(2, roundsLeft - 1)}`;
  };

  const rounds = groupByRound(matches);
  const totalRounds = Object.keys(rounds).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-[95vw] mx-auto px-4">
          <div className="mb-12 text-center">
            <Button variant="ghost" onClick={() => navigate('/tournaments')} className="mb-4">
              <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="relative inline-block">
              <div className="flex justify-center gap-4 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} name="Star" className="h-6 w-6 text-purple-400/60" />
                ))}
              </div>
              <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                CHAMPIONSHIP
              </h1>
              <p className="text-2xl font-bold text-purple-300 tracking-widest">2024 TOURNAMENT</p>
            </div>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-8 bg-purple-900/30 rounded-xl border-2 border-purple-500/30">
                <Icon name="GitBranch" className="h-16 w-16 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-bold mb-2 text-purple-200">Турнирная сетка не сгенерирована</h3>
                <p className="text-purple-300/70">Администратор должен сгенерировать сетку в админ-панели</p>
              </div>
            </div>
          ) : (
            <div className="relative flex gap-8 overflow-x-auto pb-6 justify-center items-start">
              {Object.entries(rounds).map(([round, roundMatches], index) => (
                <div key={round} className="min-w-[280px] space-y-6 flex flex-col items-center">
                  <div className="sticky top-0 z-10 bg-purple-900/40 backdrop-blur-md px-6 py-3 rounded-full border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
                    <h3 className="font-black text-xl text-center text-purple-200 tracking-wider">
                      {getRoundName(parseInt(round), totalRounds)}
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {roundMatches.map(renderMatch)}
                  </div>
                  
                  {/* Центральная эмблема для финала */}
                  {parseInt(round) === totalRounds && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"></div>
                        <div className="relative w-40 h-40 rounded-full border-4 border-purple-400/50 bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-md flex items-center justify-center shadow-2xl shadow-purple-500/30">
                          <div className="text-center">
                            <Icon name="Trophy" className="h-16 w-16 mx-auto mb-2 text-yellow-400" />
                            <p className="text-xs font-bold text-purple-200">VICTORY</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {editMatch && (
        <Dialog open={!!editMatch} onOpenChange={() => setEditMatch(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать матч</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-2 block">Счет {editMatch.team1?.name}</label>
                  <Input
                    type="number"
                    defaultValue={editMatch.score_team1}
                    onChange={(e) => setEditMatch({ ...editMatch, score_team1: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm mb-2 block">Счет {editMatch.team2?.name}</label>
                  <Input
                    type="number"
                    defaultValue={editMatch.score_team2}
                    onChange={(e) => setEditMatch({ ...editMatch, score_team2: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm mb-2 block">Карта</label>
                <Input
                  defaultValue={editMatch.map_name || ''}
                  onChange={(e) => setEditMatch({ ...editMatch, map_name: e.target.value })}
                  placeholder="de_dust2"
                />
              </div>

              <div>
                <label className="text-sm mb-2 block">Дата и время</label>
                <Input
                  type="datetime-local"
                  defaultValue={editMatch.scheduled_at ? new Date(editMatch.scheduled_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditMatch({ ...editMatch, scheduled_at: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => updateMatch(editMatch.id, editMatch.score_team1, editMatch.score_team2)}>
                  <Icon name="Save" className="h-4 w-4 mr-2" />
                  Сохранить счет
                </Button>
                <Button variant="secondary" onClick={() => completeMatch(editMatch.id)}>
                  <Icon name="Check" className="h-4 w-4 mr-2" />
                  Завершить матч
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}