import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import EsportsBracket from '@/components/brackets/EsportsBracket';
import CyberpunkBracket from '@/components/brackets/CyberpunkBracket';
import MinimalBracket from '@/components/brackets/MinimalBracket';

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

export default function TournamentBracketFullscreen() {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [bracketStyle, setBracketStyle] = useState<string>('esports');

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
        setBracketStyle(data.style || 'esports');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.close()}
          className="border-white/10 text-white hover:bg-white/5"
        >
          <Icon name="X" className="h-4 w-4 mr-2" />
          Закрыть
        </Button>
      </div>

      <main className="py-6 px-4">
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-[#1a1f2e] rounded-xl border border-white/10">
              <Icon name="GitBranch" className="h-16 w-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-2 text-white">Турнирная сетка не сгенерирована</h3>
              <p className="text-gray-400">Администратор должен сгенерировать сетку в админ-панели</p>
            </div>
          </div>
        ) : (
          <>
            {bracketStyle === 'esports' && (
              <EsportsBracket
                matches={matches}
                canEdit={canEdit}
                onMatchClick={() => {}}
                onEditMatch={setEditMatch}
              />
            )}
            {bracketStyle === 'cyberpunk' && (
              <CyberpunkBracket
                matches={matches}
                canEdit={canEdit}
                onMatchClick={() => {}}
                onEditMatch={setEditMatch}
              />
            )}
            {bracketStyle === 'minimal' && (
              <MinimalBracket
                matches={matches}
                canEdit={canEdit}
                onMatchClick={() => {}}
                onEditMatch={setEditMatch}
              />
            )}
          </>
        )}
      </main>

      {editMatch && (
        <Dialog open={!!editMatch} onOpenChange={() => setEditMatch(null)}>
          <DialogContent className="bg-[#1a1f2e] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Редактировать матч</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-2 block text-gray-300">Счет {editMatch.team1?.name}</label>
                  <Input
                    type="number"
                    defaultValue={editMatch.score_team1}
                    onChange={(e) => setEditMatch({ ...editMatch, score_team1: parseInt(e.target.value) })}
                    className="bg-[#0a0e1a] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm mb-2 block text-gray-300">Счет {editMatch.team2?.name}</label>
                  <Input
                    type="number"
                    defaultValue={editMatch.score_team2}
                    onChange={(e) => setEditMatch({ ...editMatch, score_team2: parseInt(e.target.value) })}
                    className="bg-[#0a0e1a] border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={() => updateMatch(editMatch.id, editMatch.score_team1, editMatch.score_team2)}>
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
    </div>
  );
}
