import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Tournament {
  id: number;
  name: string;
  description: string;
  start_date: string;
  max_teams: number;
  format: string;
  prize_pool: string;
  status: string;
  registration_open: boolean;
  registered_teams: any[];
}

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.id) {
      Promise.all([loadTournament(), loadUserTeams()]);
    } else {
      loadTournament();
    }
  }, [id]);

  const loadTournament = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id?.toString() || '0',
        },
        body: JSON.stringify({
          action: 'get_tournament',
          tournament_id: parseInt(id || '0'),
        }),
      });

      const data = await response.json();
      if (data.tournament) {
        setTournament(data.tournament);
      }
    } catch (error) {
      console.error('Ошибка загрузки турнира:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserTeams = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || '0'
        },
        body: JSON.stringify({
          action: 'get_user_teams'
        }),
      });

      const data = await response.json();
      if (data.teams) {
        setUserTeams(data.teams);
      }
    } catch (error) {
      console.error('Ошибка загрузки команд:', error);
    }
  };

  const handleRegister = async (teamId: number) => {
    if (!user.id) {
      toast({
        title: 'Ошибка',
        description: 'Войдите в систему для регистрации',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'register_team',
          tournament_id: parseInt(id || '0'),
          team_id: teamId,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно!',
          description: data.message,
        });
        if (data.tournament) {
          setTournament(data.tournament);
        } else {
          loadTournament();
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось зарегистрироваться',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Ошибка сети',
        variant: 'destructive',
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Турнир не найден</h2>
            <Button onClick={() => navigate('/tournaments')}>Вернуться к турнирам</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getTournamentSize = (format: string): number => {
    const match = format?.match(/(\d+)v\d+/);
    return match ? parseInt(match[1]) : 4;
  };

  const tournamentSize = getTournamentSize(tournament.format);
  
  const eligibleTeams = userTeams.filter(team => team.team_size === tournamentSize);
  
  const userRegistration = tournament.registered_teams?.find(t => 
    userTeams.some(ut => ut.id === t.team_id)
  );
  
  const isRegistered = !!userRegistration;
  const registrationStatus = userRegistration?.status || null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Button onClick={() => navigate('/tournaments')} variant="ghost" className="mb-6">
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад к турнирам
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-3xl mb-2">{tournament.name}</CardTitle>
                    <CardDescription className="text-base">{tournament.description}</CardDescription>
                  </div>
                  <Badge variant={tournament.registration_open ? 'default' : 'outline'}>
                    {tournament.registration_open ? 'Регистрация открыта' : 'Регистрация закрыта'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Дата начала</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      {new Date(tournament.start_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Формат</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Icon name="Users" size={16} />
                      {tournament.format || '5v5'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Призовой фонд</p>
                    <p className="font-semibold flex items-center gap-2 text-primary">
                      <Icon name="Trophy" size={16} />
                      {tournament.prize_pool}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Команд</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Icon name="Gamepad2" size={16} />
                      {tournament.registered_teams?.length || 0} / {tournament.max_teams}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="teams">
              <TabsList>
                <TabsTrigger value="teams">Участники ({tournament.registered_teams?.length || 0})</TabsTrigger>
                <TabsTrigger value="bracket">Сетка</TabsTrigger>
                <TabsTrigger value="rules">Правила</TabsTrigger>
              </TabsList>

              <TabsContent value="teams">
                <Card>
                  <CardHeader>
                    <CardTitle>Зарегистрированные команды</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tournament.registered_teams && tournament.registered_teams.length > 0 ? (
                      <div className="space-y-3">
                        {tournament.registered_teams.map((reg, index) => (
                          <div key={reg.id} className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary/50 transition-colors">
                            <div className="text-2xl font-bold w-8 text-center text-muted-foreground">#{index + 1}</div>
                            {reg.team_logo ? (
                              <img src={reg.team_logo} alt={reg.team_name} className="w-12 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                                <Icon name="Shield" size={24} className="text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{reg.team_name}</p>
                                {reg.team_tag && <span className="text-xs text-muted-foreground">[{reg.team_tag}]</span>}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                {reg.team_rating && (
                                  <>
                                    <span key="rating" className="flex items-center gap-1">
                                      <Icon name="Star" size={12} />
                                      {reg.team_rating}
                                    </span>
                                    <span key="dot">•</span>
                                  </>
                                )}
                                <span>
                                  Регистрация: {new Date(reg.registered_at).toLocaleDateString('ru-RU')}
                                </span>
                              </div>
                            </div>
                            <Badge variant={
                              reg.status === 'approved' ? 'default' : 
                              reg.status === 'rejected' ? 'destructive' : 
                              'outline'
                            }>
                              {reg.status === 'approved' ? 'Подтверждено' : 
                               reg.status === 'rejected' ? 'Отклонено' : 
                               'На рассмотрении'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Пока нет зарегистрированных команд</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bracket">
                <Card>
                  <CardHeader>
                    <CardTitle>Турнирная сетка</CardTitle>
                    <CardDescription>Сетка будет доступна после начала турнира</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate(`/tournaments/${tournament.id}/bracket`)}>
                      <Icon name="GitBranch" size={18} className="mr-2" />
                      Открыть сетку
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rules">
                <Card>
                  <CardHeader>
                    <CardTitle>Правила турнира</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p>• Формат: {tournament.format || '5v5'}</p>
                    <p>• Максимум команд: {tournament.max_teams}</p>
                    <p>• Призовой фонд: {tournament.prize_pool}</p>
                    <p>• Дата начала: {new Date(tournament.start_date).toLocaleString('ru-RU')}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Регистрация</CardTitle>
                <CardDescription>
                  {isRegistered
                    ? 'Ваша команда уже зарегистрирована'
                    : 'Выберите команду для участия'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user.id ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Войдите для регистрации</p>
                    <Button onClick={() => navigate('/login')} className="w-full">
                      Войти
                    </Button>
                  </div>
                ) : isRegistered ? (
                  <div className="text-center space-y-4">
                    {registrationStatus === 'approved' ? (
                      <>
                        <Icon name="CheckCircle" size={48} className="mx-auto text-green-500" />
                        <p className="text-sm font-semibold text-green-500">Заявка одобрена</p>
                        <p className="text-xs text-muted-foreground">Ваша команда допущена к участию</p>
                      </>
                    ) : registrationStatus === 'rejected' ? (
                      <>
                        <Icon name="XCircle" size={48} className="mx-auto text-red-500" />
                        <p className="text-sm font-semibold text-red-500">Заявка отклонена</p>
                        <p className="text-xs text-muted-foreground">К сожалению, ваша команда не прошла отбор</p>
                      </>
                    ) : (
                      <>
                        <Icon name="Clock" size={48} className="mx-auto text-yellow-500" />
                        <p className="text-sm font-semibold text-yellow-500">Заявка на рассмотрении</p>
                        <p className="text-xs text-muted-foreground">Ожидайте решения администрации</p>
                      </>
                    )}
                  </div>
                ) : !tournament.registration_open ? (
                  <div className="text-center space-y-4">
                    <Icon name="Lock" size={48} className="mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Регистрация закрыта</p>
                  </div>
                ) : userTeams.length === 0 ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">У вас нет команд</p>
                    <Button onClick={() => navigate('/teams/create')} className="w-full">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Создать команду
                    </Button>
                  </div>
                ) : eligibleTeams.length === 0 ? (
                  <div className="text-center space-y-4">
                    <Icon name="AlertCircle" size={48} className="mx-auto text-amber-500" />
                    <p className="text-sm font-semibold">Нет подходящих команд</p>
                    <p className="text-xs text-muted-foreground">
                      Для турнира {tournament.format} нужна команда из {tournamentSize} игроков
                    </p>
                    <Button onClick={() => navigate('/teams/create')} className="w-full">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Создать подходящую команду
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Доступные команды для формата {tournament.format}:
                    </p>
                    {eligibleTeams.map((team) => (
                      <Button
                        key={team.id}
                        onClick={() => handleRegister(team.id)}
                        disabled={registering || !team.is_captain}
                        variant="outline"
                        className="w-full justify-start h-auto py-3"
                      >
                        <div className="flex items-center gap-3 w-full">
                          {team.logo_url && (
                            <img src={team.logo_url} alt={team.name} className="w-10 h-10 rounded" />
                          )}
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{team.name}</span>
                              {team.tag && <span className="text-xs text-muted-foreground">[{team.tag}]</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Icon name="Star" size={12} />
                                {team.rating}
                              </span>
                              <span>•</span>
                              <span>{team.wins}W / {team.losses}L</span>
                              {team.is_captain && (
                                <>
                                  <span key="dot">•</span>
                                  <span key="captain" className="text-yellow-500 flex items-center gap-1">
                                    <Icon name="Crown" size={12} />
                                    Вы капитан
                                  </span>
                                </>
                              )}
                            </div>
                            {!team.is_captain && (
                              <p className="text-xs text-amber-600 mt-1">
                                Только капитан может регистрировать команду
                              </p>
                            )}
                          </div>
                          {team.is_captain && <Icon name="ChevronRight" size={18} />}
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Info" size={20} />
                  Информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Регистрация происходит мгновенно</p>
                <p>• Ваша команда будет добавлена в список участников</p>
                <p>• Администраторы подтвердят участие</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}