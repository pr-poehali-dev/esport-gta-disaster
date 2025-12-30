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
          team1: m.team1_id ? { id: m.team1_id, name: m.team1_name || 'TBD' } : null,
          team2: m.team2_id ? { id: m.team2_id, name: m.team2_name || 'TBD' } : null,
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
    <Card key={match.id} className="p-4 bg-card/50 relative group cursor-pointer hover:border-primary transition-colors"
      onClick={() => navigate(`/matches/${match.id}`)}>
      {canEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            setEditMatch(match);
          }}
        >
          <Icon name="Edit" className="h-4 w-4" />
        </Button>
      )}

      <div className="space-y-2">
        <div 
          className="flex items-center justify-between p-3 bg-background/50 rounded"
        >
          <div className="flex items-center gap-3">
            {match.team1?.logo_url && (
              <img src={match.team1.logo_url} alt="" className="w-8 h-8 rounded" />
            )}
            <span className={`font-bold ${match.winner_id === match.team1?.id ? 'text-green-500' : ''}`}>
              {match.team1?.name || 'TBD'}
            </span>
          </div>
          <span className="text-2xl font-bold">{match.score_team1}</span>
        </div>

        <div 
          className="flex items-center justify-between p-3 bg-background/50 rounded"
        >
          <div className="flex items-center gap-3">
            {match.team2?.logo_url && (
              <img src={match.team2.logo_url} alt="" className="w-8 h-8 rounded" />
            )}
            <span className={`font-bold ${match.winner_id === match.team2?.id ? 'text-green-500' : ''}`}>
              {match.team2?.name || 'TBD'}
            </span>
          </div>
          <span className="text-2xl font-bold">{match.score_team2}</span>
        </div>
      </div>

      {match.map_name && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Map" className="h-4 w-4" />
          <span>{match.map_name}</span>
        </div>
      )}

      {match.scheduled_at && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="Calendar" className="h-4 w-4" />
          <span>{new Date(match.scheduled_at).toLocaleString('ru-RU')}</span>
        </div>
      )}
      
      <div className="text-center pt-3 mt-3 border-t border-border">
        <span className="text-xs text-primary font-medium">Нажмите для подробностей →</span>
      </div>
    </Card>
  );

  const groupByRound = (matches: Match[]) => {
    const rounds: { [key: number]: Match[] } = {};
    matches.forEach(match => {
      if (!rounds[match.round]) rounds[match.round] = [];
      rounds[match.round].push(match);
    });
    return rounds;
  };

  const rounds = groupByRound(matches);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="ghost" onClick={() => navigate('/tournaments')}>
                <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <h1 className="text-4xl font-black mt-4">Турнирная сетка</h1>
              <p className="text-muted-foreground">Формат: {format}</p>
            </div>


          </div>

          <div className="flex gap-6 overflow-x-auto pb-6">
            {Object.entries(rounds).map(([round, roundMatches]) => (
              <div key={round} className="min-w-[300px] space-y-4">
                <h3 className="font-bold text-lg text-center mb-4">
                  Раунд {round}
                </h3>
                {roundMatches.map(renderMatch)}
              </div>
            ))}
          </div>
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