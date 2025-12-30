import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface Registration {
  id: number;
  team_id: number;
  team_name: string;
  team_tag?: string;
  team_logo?: string;
  team_rating?: number;
  status: string;
  registered_at: string;
}

interface Tournament {
  id: number;
  name: string;
  description: string;
}

export default function AdminTournamentRegistrations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      if (!['admin', 'founder', 'moderator'].includes(userData.role)) {
        showNotification('error', 'Доступ запрещен', 'У вас нет прав администратора');
        navigate('/');
        return;
      }
    } else {
      navigate('/');
      return;
    }

    loadTournamentData();
  }, [id]);

  const loadTournamentData = async () => {
    try {
      const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : '';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'get_tournament',
          tournament_id: parseInt(id || '0')
        })
      });

      const data = await response.json();
      
      if (response.ok && data.tournament) {
        setTournament(data.tournament);
        setRegistrations(data.tournament.registered_teams || []);
      } else {
        showNotification('error', 'Ошибка', 'Не удалось загрузить данные турнира');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'approve_registration',
          registration_id: registrationId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', 'Успех', 'Заявка одобрена');
        loadTournamentData();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось одобрить заявку');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleReject = async (registrationId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'reject_registration',
          registration_id: registrationId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', 'Успех', 'Заявка отклонена');
        loadTournamentData();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось отклонить заявку');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      pending: { variant: 'outline', label: 'На рассмотрении' },
      approved: { variant: 'default', label: 'Одобрено' },
      rejected: { variant: 'destructive', label: 'Отклонено' }
    };

    const { variant, label } = statusMap[status] || statusMap.pending;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold mb-2">Турнир не найден</h3>
        <Button onClick={() => navigate('/admin/tournaments')}>
          Вернуться к турнирам
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <Button variant="ghost" onClick={() => navigate('/admin/tournaments')}>
        <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
        Назад к турнирам
      </Button>

      <div>
        <h1 className="text-3xl font-black mb-2">Заявки на турнир</h1>
        <p className="text-muted-foreground">{tournament.name}</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{registrations.length}</div>
                <div className="text-sm text-muted-foreground">Всего заявок</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  {registrations.filter(r => r.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Одобрено</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">
                  {registrations.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">На рассмотрении</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Список заявок</CardTitle>
            <CardDescription>Управление заявками команд на участие в турнире</CardDescription>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="Users" className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Пока нет заявок на турнир</p>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg, index) => (
                  <div
                    key={reg.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className="text-2xl font-bold w-8 text-center text-muted-foreground">
                      #{index + 1}
                    </div>
                    
                    {reg.team_logo ? (
                      <img
                        src={reg.team_logo}
                        alt={reg.team_name}
                        className="w-14 h-14 rounded object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                        <Icon name="Shield" size={28} className="text-primary" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">{reg.team_name}</h3>
                        {reg.team_tag && (
                          <span className="text-sm text-muted-foreground">[{reg.team_tag}]</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {reg.team_rating && (
                          <>
                            <span className="flex items-center gap-1">
                              <Icon name="Star" size={14} />
                              {reg.team_rating}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span>
                          Подана: {new Date(reg.registered_at).toLocaleString('ru-RU')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(reg.status)}
                      
                      {reg.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reg.id)}
                          >
                            <Icon name="Check" className="h-4 w-4 mr-2" />
                            Одобрить
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(reg.id)}
                          >
                            <Icon name="X" className="h-4 w-4 mr-2" />
                            Отклонить
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
