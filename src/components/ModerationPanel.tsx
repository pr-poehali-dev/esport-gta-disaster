import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playSuccessSound } from '@/utils/sounds';

interface ModerationPanelProps {
  tournamentName?: string;
}

export default function ModerationPanel({ tournamentName }: ModerationPanelProps) {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderating, setModerating] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    loadRegistrations();
  }, [tournamentName]);

  const loadRegistrations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const url = tournamentName 
        ? `https://functions.poehali.dev/5b647bf2-2cba-46c5-8fb5-57bd855a039d?tournament=${encodeURIComponent(tournamentName)}`
        : 'https://functions.poehali.dev/5b647bf2-2cba-46c5-8fb5-57bd855a039d';
      
      const response = await fetch(url, {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.log('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (registrationId: number, status: 'approved' | 'rejected') => {
    playClickSound();
    setModerating(registrationId);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/5b647bf2-2cba-46c5-8fb5-57bd855a039d', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          registration_id: registrationId,
          status: status,
          comment: comments[registrationId] || ''
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка модерации');
      }

      playSuccessSound();
      toast({
        title: status === 'approved' ? "✅ Заявка одобрена!" : "❌ Заявка отклонена",
        description: "Решение сохранено",
        className: status === 'approved' 
          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
          : "bg-gradient-to-r from-red-500 to-orange-500 text-white border-0",
      });

      loadRegistrations();
      setComments({ ...comments, [registrationId]: '' });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : 'Не удалось обработать заявку',
        variant: "destructive"
      });
    } finally {
      setModerating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-500 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-500 border-red-500/30'
    };

    const labels = {
      pending: '⏳ На рассмотрении',
      approved: '✅ Одобрено',
      rejected: '❌ Отклонено'
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || ''}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardContent className="py-12 text-center text-muted-foreground">
          Загрузка...
        </CardContent>
      </Card>
    );
  }

  const pendingCount = registrations.filter(r => r.moderation_status === 'pending').length;

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Shield" size={24} className="text-primary" />
            Модерация заявок
          </div>
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            {pendingCount} на рассмотрении
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="FileCheck" size={48} className="mx-auto mb-4 opacity-30" />
            <p>Нет заявок для модерации</p>
          </div>
        ) : (
          <div className="space-y-6">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className={`p-5 rounded-lg border-2 transition-all ${
                  reg.moderation_status === 'pending'
                    ? 'border-yellow-500/40 bg-yellow-500/5'
                    : reg.moderation_status === 'approved'
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{reg.logo_url}</div>
                    <div>
                      <div className="text-xl font-black">{reg.team_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Капитан: {reg.captain_nickname}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Подано: {new Date(reg.registered_at).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(reg.moderation_status)}
                </div>

                {reg.roster && reg.roster.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg bg-card/50 border border-primary/10">
                    <div className="text-sm font-bold mb-2">Состав команды:</div>
                    <div className="flex flex-wrap gap-2">
                      {reg.roster.map((player: any, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className={
                            player.player_role === 'main'
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
                          }
                        >
                          {player.player_role === 'reserve' && '⚡ '}
                          {player.player_nickname}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {reg.moderation_status === 'pending' ? (
                  <div className="space-y-3 border-t border-primary/20 pt-4">
                    <Textarea
                      value={comments[reg.id] || ''}
                      onChange={(e) => setComments({ ...comments, [reg.id]: e.target.value })}
                      placeholder="Комментарий (необязательно)"
                      className="min-h-[60px] border-primary/30"
                      disabled={moderating === reg.id}
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleModerate(reg.id, 'approved')}
                        disabled={moderating === reg.id}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                      >
                        {moderating === reg.id ? (
                          <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        ) : (
                          <Icon name="Check" size={18} className="mr-2" />
                        )}
                        Одобрить
                      </Button>
                      <Button
                        onClick={() => handleModerate(reg.id, 'rejected')}
                        disabled={moderating === reg.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {moderating === reg.id ? (
                          <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                        ) : (
                          <Icon name="X" size={18} className="mr-2" />
                        )}
                        Отклонить
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-primary/20 pt-3">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icon name="User" size={14} />
                        Модератор: {reg.moderator_nickname || 'Неизвестно'}
                      </div>
                      {reg.moderation_comment && (
                        <div className="mt-2 p-2 rounded bg-card/50 text-xs">
                          {reg.moderation_comment}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
