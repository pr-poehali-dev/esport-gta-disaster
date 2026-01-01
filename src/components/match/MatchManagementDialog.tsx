import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface MatchManagementDialogProps {
  matchId: number | null;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MatchManagementDialog({ matchId, onClose, onUpdate }: MatchManagementDialogProps) {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [team1Score, setTeam1Score] = useState<number>(0);
  const [team2Score, setTeam2Score] = useState<number>(0);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isReferee = ['admin', 'founder', 'organizer', 'referee'].includes(user.role);

  useEffect(() => {
    if (matchId) {
      loadMatchDetails();
    }
  }, [matchId]);

  const loadMatchDetails = async () => {
    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_match_details',
          match_id: matchId,
          user_id: user.id,
        }),
      });

      const data = await response.json();
      if (data.match) {
        setMatch(data.match);
        setTeam1Score(data.match.reported_team1 || data.match.score_team1 || 0);
        setTeam2Score(data.match.reported_team2 || data.match.score_team2 || 0);
      }
    } catch (error) {
      console.error('Ошибка загрузки матча:', error);
    }
  };

  const handleSubmitScore = async () => {
    if (!match.is_captain) {
      toast({
        title: 'Ошибка',
        description: 'Только капитан команды может отправлять результат',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const isCaptainTeam1 = match.captain_team_id === match.team1?.id;
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_match_score',
          match_id: matchId,
          user_id: user.id,
          team_score: isCaptainTeam1 ? team1Score : team2Score,
          opponent_score: isCaptainTeam1 ? team2Score : team1Score,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadMatchDetails();
        onUpdate();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить результат',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetScore = async () => {
    if (!isReferee) return;

    setLoading(true);
    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'reset_match_score',
          match_id: matchId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadMatchDetails();
        onUpdate();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось сбросить счет',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async () => {
    if (!isReferee) return;

    if (team1Score === team2Score) {
      toast({
        title: 'Ошибка',
        description: 'Счет не может быть равным',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'confirm_match',
          match_id: matchId,
          team1_score: team1Score,
          team2_score: team2Score,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        onClose();
        onUpdate();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось подтвердить матч',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!matchId || !match) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-purple-900/50 border-purple-500/30">
        <CardHeader className="border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-purple-100">Управление матчем</CardTitle>
              <CardDescription className="text-purple-300/70">{match.tournament_name}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-purple-300 hover:text-purple-100"
            >
              <Icon name="X" className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-purple-950/50 rounded-lg border border-purple-500/20">
                {match.team1?.logo_url && (
                  <img src={match.team1.logo_url} alt="" className="w-12 h-12 rounded-full border-2 border-purple-400/50" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-purple-100">{match.team1?.name || 'TBD'}</p>
                  <p className="text-xs text-purple-300/70">Команда 1</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Счет команды 1</label>
                <Input
                  type="number"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                  disabled={!isReferee && !match.is_captain}
                  className="bg-purple-950/30 border-purple-500/30 text-purple-100"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-purple-950/50 rounded-lg border border-purple-500/20">
                {match.team2?.logo_url && (
                  <img src={match.team2.logo_url} alt="" className="w-12 h-12 rounded-full border-2 border-purple-400/50" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-purple-100">{match.team2?.name || 'TBD'}</p>
                  <p className="text-xs text-purple-300/70">Команда 2</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300">Счет команды 2</label>
                <Input
                  type="number"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                  disabled={!isReferee && !match.is_captain}
                  className="bg-purple-950/30 border-purple-500/30 text-purple-100"
                />
              </div>
            </div>
          </div>

          {match.reported_team1 !== null && match.reported_team2 !== null && (
            <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="AlertCircle" className="h-5 w-5 text-purple-300" />
                <p className="font-semibold text-purple-200">Результат от капитанов:</p>
              </div>
              <p className="text-purple-300">
                {match.team1?.name}: {match.reported_team1} - {match.team2?.name}: {match.reported_team2}
              </p>
            </div>
          )}

          {match.moderator_verified && (
            <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" className="h-5 w-5 text-green-400" />
                <p className="font-semibold text-green-300">Результат подтвержден судьей</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {match.is_captain && !match.moderator_verified && (
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleSubmitScore}
                disabled={loading}
              >
                <Icon name="Send" className="h-4 w-4 mr-2" />
                {loading ? 'Отправка...' : 'Отправить результат'}
              </Button>
            )}

            {isReferee && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-900/50"
                  onClick={handleResetScore}
                  disabled={loading}
                >
                  <Icon name="RotateCcw" className="h-4 w-4 mr-2" />
                  Сбросить счет
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmMatch}
                  disabled={loading || match.status === 'completed'}
                >
                  <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                  {loading ? 'Подтверждение...' : 'Подтвердить матч'}
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-purple-500/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-purple-400">Раунд</p>
                <p className="font-semibold text-purple-100">Раунд {match.round}</p>
              </div>
              <div>
                <p className="text-purple-400">Статус</p>
                <p className="font-semibold text-purple-100">
                  {match.status === 'completed' ? 'Завершен' : 
                   match.status === 'in_progress' ? 'В процессе' : 'Ожидание'}
                </p>
              </div>
              {match.scheduled_at && (
                <div className="col-span-2">
                  <p className="text-purple-400">Время</p>
                  <p className="font-semibold text-purple-100">
                    {new Date(match.scheduled_at).toLocaleString('ru-RU')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
