import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playHoverSound, playSuccessSound } from '@/utils/sounds';

interface Team {
  id: number;
  name: string;
  logo_url: string;
  captain_nickname: string;
  roster: any[];
}

interface Registration {
  id: number;
  team_id: number;
  team_name: string;
  tournament_name: string;
  captain_nickname: string;
  discord_contact: string;
  comment: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_comment?: string;
  created_at: string;
}

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    tournament_name: 'Winter Championship 2025',
    discord_contact: '',
    comment: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!userData.id) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо войти в систему',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      setUser(userData);

      const teamResponse = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0', {
        headers: { 'X-User-Id': userData.id?.toString() || '' }
      });
      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeam(teamData);
      }

      const regResponse = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        headers: { 'X-User-Id': userData.id?.toString() || '' }
      });
      
      if (regResponse.ok) {
        const regData = await regResponse.json();
        setRegistrations(regData);
      }

      if (userData.is_organizer || userData.user_status === 'Главный администратор' || userData.user_status === 'Администратор') {
        const allRegResponse = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53?action=all', {
          headers: { 'X-User-Id': userData.id?.toString() || '' }
        });
        
        if (allRegResponse.ok) {
          const allRegData = await allRegResponse.json();
          setAllRegistrations(allRegData);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!team) {
      toast({
        title: 'Ошибка',
        description: 'Сначала создайте команду в профиле',
        variant: 'destructive'
      });
      return;
    }

    if (team.roster?.length < 5) {
      toast({
        title: 'Ошибка',
        description: 'В команде должно быть минимум 5 игроков',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    playClickSound();

    try {
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      playSuccessSound();
      toast({
        title: '✅ Заявка подана!',
        description: 'Ваша заявка отправлена на модерацию',
        className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
      });

      setFormData({
        tournament_name: 'Winter Championship 2025',
        discord_contact: '',
        comment: ''
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось подать заявку',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (registrationId: number, status: 'approved' | 'rejected', comment?: string) => {
    playClickSound();
    
    try {
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          registration_id: registrationId,
          moderation_status: status,
          moderation_comment: comment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      playSuccessSound();
      toast({
        title: '✅ Статус обновлен',
        description: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
        className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус заявки',
        variant: 'destructive'
      });
    }
  };

  const filteredRegistrations = statusFilter === 'all' 
    ? allRegistrations 
    : allRegistrations.filter(r => r.moderation_status === statusFilter);

  const isAdmin = user?.is_organizer || user?.user_status === 'Главный администратор' || user?.user_status === 'Администратор';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e] flex items-center justify-center">
        <div className="text-2xl font-bold text-primary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEzLDE0OCwyMzEsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <header className="relative z-10 border-b border-primary/20 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <Icon name="ArrowLeft" size={20} />
              <span className="font-bold">На главную</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-2 border-primary/30"
            >
              <Icon name="User" size={20} />
              <span className="font-bold">Профиль</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  РЕГИСТРАЦИЯ НА ТУРНИР
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">Подайте заявку от своей команды на участие</p>
            </div>

            <div className="grid gap-6">
              {!isAdmin && (
                <>
                  <Card className="border-primary/30 bg-card/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Icon name="FileText" className="text-primary" size={24} />
                        Подать заявку
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {team ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{team.logo_url}</div>
                              <div>
                                <div className="text-xl font-black">{team.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Капитан: {team.captain_nickname}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Игроков: {team.roster?.length || 0}/7
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-bold mb-2 block">Турнир</label>
                            <Input
                              value={formData.tournament_name}
                              onChange={(e) => setFormData({...formData, tournament_name: e.target.value})}
                              className="bg-background/50 border-primary/30"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-sm font-bold mb-2 block">Discord для связи</label>
                            <Input
                              value={formData.discord_contact}
                              onChange={(e) => setFormData({...formData, discord_contact: e.target.value})}
                              placeholder="username#1234"
                              className="bg-background/50 border-primary/30"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-sm font-bold mb-2 block">Комментарий (необязательно)</label>
                            <Textarea
                              value={formData.comment}
                              onChange={(e) => setFormData({...formData, comment: e.target.value})}
                              placeholder="Дополнительная информация о команде..."
                              className="bg-background/50 border-primary/30 min-h-[100px]"
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={submitting || !team || (team.roster?.length || 0) < 5}
                            onMouseEnter={playHoverSound}
                            className="w-full bg-gradient-to-r from-primary to-secondary"
                          >
                            <Icon name="Send" size={18} className="mr-2" />
                            {submitting ? 'Отправка...' : 'Подать заявку'}
                          </Button>

                          {team && (team.roster?.length || 0) < 5 && (
                            <div className="text-sm text-yellow-500 text-center">
                              ⚠️ Для регистрации необходимо минимум 5 игроков в составе
                            </div>
                          )}
                        </form>
                      ) : (
                        <div className="text-center py-8">
                          <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                          <p className="text-muted-foreground mb-4">У вас нет команды</p>
                          <Button
                            onClick={() => navigate('/profile')}
                            onMouseEnter={playHoverSound}
                            className="bg-gradient-to-r from-primary to-secondary"
                          >
                            <Icon name="Plus" size={18} className="mr-2" />
                            Создать команду
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-primary/30 bg-card/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Icon name="List" className="text-primary" size={24} />
                        Мои заявки
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {registrations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>У вас пока нет поданных заявок</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {registrations.map(reg => (
                            <div key={reg.id} className="p-4 rounded-lg border border-primary/20 bg-background/50">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="font-bold text-lg">{reg.tournament_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Команда: {reg.team_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Discord: {reg.discord_contact}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Подана: {new Date(reg.created_at).toLocaleDateString('ru-RU')}
                                  </div>
                                </div>
                                <Badge className={
                                  reg.moderation_status === 'pending' 
                                    ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' 
                                    : reg.moderation_status === 'approved'
                                    ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                    : 'bg-red-500/20 text-red-500 border-red-500/30'
                                }>
                                  {reg.moderation_status === 'pending' && '⏳ На рассмотрении'}
                                  {reg.moderation_status === 'approved' && '✅ Одобрено'}
                                  {reg.moderation_status === 'rejected' && '❌ Отклонено'}
                                </Badge>
                              </div>
                              
                              {reg.comment && (
                                <div className="mb-2 p-3 rounded bg-muted/30 text-sm">
                                  <div className="text-xs text-muted-foreground mb-1">Комментарий:</div>
                                  {reg.comment}
                                </div>
                              )}

                              {reg.moderation_comment && (
                                <div className="p-3 rounded bg-primary/10 text-sm border border-primary/20">
                                  <div className="text-xs text-primary mb-1">Комментарий модератора:</div>
                                  {reg.moderation_comment}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}

              {isAdmin && (
                <Card className="border-primary/30 bg-card/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Shield" className="text-primary" size={24} />
                        Модерация заявок
                      </div>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[200px] bg-background/50 border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все заявки</SelectItem>
                          <SelectItem value="pending">На рассмотрении</SelectItem>
                          <SelectItem value="approved">Одобренные</SelectItem>
                          <SelectItem value="rejected">Отклоненные</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredRegistrations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Нет заявок для отображения</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredRegistrations.map(reg => (
                          <ModerationCard
                            key={reg.id}
                            registration={reg}
                            onUpdateStatus={handleUpdateStatus}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface ModerationCardProps {
  registration: Registration;
  onUpdateStatus: (id: number, status: 'approved' | 'rejected', comment?: string) => void;
}

const ModerationCard = ({ registration, onUpdateStatus }: ModerationCardProps) => {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleApprove = () => {
    playClickSound();
    onUpdateStatus(registration.id, 'approved');
  };

  const handleReject = () => {
    playClickSound();
    if (showComment) {
      onUpdateStatus(registration.id, 'rejected', comment);
      setShowComment(false);
      setComment('');
    } else {
      setShowComment(true);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-primary/20 bg-background/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-bold text-lg">{registration.team_name}</div>
            <Badge className={
              registration.moderation_status === 'pending' 
                ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' 
                : registration.moderation_status === 'approved'
                ? 'bg-green-500/20 text-green-500 border-green-500/30'
                : 'bg-red-500/20 text-red-500 border-red-500/30'
            }>
              {registration.moderation_status === 'pending' && '⏳ На рассмотрении'}
              {registration.moderation_status === 'approved' && '✅ Одобрено'}
              {registration.moderation_status === 'rejected' && '❌ Отклонено'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Турнир: {registration.tournament_name}</div>
            <div>Капитан: {registration.captain_nickname}</div>
            <div>Discord: {registration.discord_contact}</div>
            <div className="text-xs">
              Подана: {new Date(registration.created_at).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {registration.comment && (
        <div className="mb-3 p-3 rounded bg-muted/30 text-sm">
          <div className="text-xs text-muted-foreground mb-1">Комментарий команды:</div>
          {registration.comment}
        </div>
      )}

      {registration.moderation_comment && (
        <div className="mb-3 p-3 rounded bg-primary/10 text-sm border border-primary/20">
          <div className="text-xs text-primary mb-1">Комментарий модератора:</div>
          {registration.moderation_comment}
        </div>
      )}

      {registration.moderation_status === 'pending' && (
        <div className="space-y-3">
          {showComment && (
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Причина отклонения..."
              className="bg-background/50 border-primary/30"
            />
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              onMouseEnter={playHoverSound}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30"
              variant="outline"
            >
              <Icon name="Check" size={18} className="mr-2" />
              Одобрить
            </Button>
            <Button
              onClick={handleReject}
              onMouseEnter={playHoverSound}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30"
              variant="outline"
            >
              <Icon name="X" size={18} className="mr-2" />
              {showComment ? 'Подтвердить отклонение' : 'Отклонить'}
            </Button>
            {showComment && (
              <Button
                onClick={() => {
                  playClickSound();
                  setShowComment(false);
                  setComment('');
                }}
                onMouseEnter={playHoverSound}
                variant="outline"
                className="border-primary/30"
              >
                Отмена
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;