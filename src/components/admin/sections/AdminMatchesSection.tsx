import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Match {
  id: number;
  tournament_name: string;
  round: number;
  match_number: number;
  team1_name?: string;
  team2_name?: string;
  team1_score?: number;
  team2_score?: number;
  status: string;
  scheduled_at?: string;
}

export default function AdminMatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [team1Score, setTeam1Score] = useState('');
  const [team2Score, setTeam2Score] = useState('');
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      // Здесь нужно будет создать endpoint для получения активных матчей
      // Пока используем заглушку
      setMatches([]);
    } catch (error) {
      console.error('Ошибка загрузки матчей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScore = async () => {
    if (!selectedMatch || !team1Score || !team2Score) {
      toast({
        title: 'Ошибка',
        description: 'Заполните счёт обеих команд',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'update_match_score',
          match_id: selectedMatch.id,
          team1_score: parseInt(team1Score),
          team2_score: parseInt(team2Score),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: 'Счёт матча обновлён',
        });
        loadMatches();
        setSelectedMatch(null);
        setTeam1Score('');
        setTeam2Score('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить счёт',
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

  const handleCompleteMatch = async (matchId: number) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'complete_match',
          match_id: matchId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: 'Матч завершён',
        });
        loadMatches();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось завершить матч',
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-600', label: 'Ожидает' },
      in_progress: { color: 'bg-blue-600', label: 'Идёт' },
      completed: { color: 'bg-green-600', label: 'Завершён' },
      cancelled: { color: 'bg-red-600', label: 'Отменён' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-600', label: status };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Trophy" size={24} />
            Управление матчами
          </CardTitle>
          <CardDescription>
            Изменяйте счёт и статус матчей турниров
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !matches.length ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Calendar" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Активных матчей пока нет</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Турнир</TableHead>
                    <TableHead>Раунд</TableHead>
                    <TableHead>Команды</TableHead>
                    <TableHead>Счёт</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">{match.tournament_name}</TableCell>
                      <TableCell>Раунд {match.round}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{match.team1_name || 'TBD'}</div>
                          <div className="text-xs text-muted-foreground">vs</div>
                          <div>{match.team2_name || 'TBD'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.team1_score !== undefined && match.team2_score !== undefined ? (
                          <div className="font-bold">
                            {match.team1_score} : {match.team2_score}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell>
                        {match.scheduled_at
                          ? new Date(match.scheduled_at).toLocaleDateString('ru-RU')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedMatch(match);
                                  setTeam1Score(match.team1_score?.toString() || '');
                                  setTeam2Score(match.team2_score?.toString() || '');
                                }}
                              >
                                <Icon name="Edit" size={16} className="mr-1" />
                                Счёт
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Изменить счёт матча</DialogTitle>
                                <DialogDescription>
                                  {match.team1_name} vs {match.team2_name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>{match.team1_name}</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={team1Score}
                                    onChange={(e) => setTeam1Score(e.target.value)}
                                    placeholder="Счёт команды 1"
                                  />
                                </div>
                                <div>
                                  <Label>{match.team2_name}</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={team2Score}
                                    onChange={(e) => setTeam2Score(e.target.value)}
                                    placeholder="Счёт команды 2"
                                  />
                                </div>
                                <Button onClick={handleUpdateScore} disabled={loading} className="w-full">
                                  <Icon name="Save" size={18} className="mr-2" />
                                  Сохранить счёт
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {match.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteMatch(match.id)}
                              disabled={loading}
                            >
                              <Icon name="CheckCircle" size={16} className="mr-1" />
                              Завершить
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
