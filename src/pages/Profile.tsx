import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playHoverSound, playSuccessSound } from '@/utils/sounds';
import AchievementBadge from '@/components/AchievementBadge';
import OrganizerBadge from '@/components/OrganizerBadge';
import UserStatusBadge from '@/components/UserStatusBadge';
import CreateTeamDialog from '@/components/CreateTeamDialog';
import EditTeamDialog from '@/components/EditTeamDialog';
import DeleteTeamDialog from '@/components/DeleteTeamDialog';
import TeamManagement from '@/components/TeamManagement';
import TournamentRegistrations from '@/components/TournamentRegistrations';
import ModerationPanel from '@/components/ModerationPanel';
import UserManagementPanel from '@/components/UserManagementPanel';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    discord: '',
    team: ''
  });
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [showTeamManagement, setShowTeamManagement] = useState(false);

  useEffect(() => {
    loadProfile();
    loadTeam();
    loadRegistrations();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setFormData({
        nickname: profile.nickname,
        discord: profile.discord || '',
        team: profile.team || ''
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить профиль",
        variant: "destructive"
      });
      navigate('/');
    }
  };

  const handleLogout = async () => {
    playClickSound();
    await authService.logout();
    toast({
      title: "Выход выполнен",
      description: "До встречи на арене!",
    });
    navigate('/');
  };

  const loadTeam = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0', {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      }
    } catch (error) {
      console.log('No team found');
    } finally {
      setLoadingTeam(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.log('Failed to load registrations');
    }
  };

  const handleRegisterTournament = async (tournamentName: string) => {
    playClickSound();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({ tournament_name: tournamentName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      playSuccessSound();
      toast({
        title: "✅ Регистрация завершена!",
        description: `Команда ${team?.name} зарегистрирована на турнир`,
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      loadRegistrations();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось зарегистрироваться',
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async () => {
    playClickSound();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0', {
        method: 'DELETE',
        headers: {
          'X-User-Id': user.id?.toString() || ''
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      playSuccessSound();
      toast({
        title: "✅ Команда удалена",
        description: "Все данные команды успешно удалены",
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      setTeam(null);
      loadRegistrations();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось удалить команду',
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updated = await authService.updateProfile(formData);
      setUser(updated);
      setIsEditing(false);
      playSuccessSound();
      
      toast({
        title: "✅ Профиль обновлен!",
        description: "Изменения успешно сохранены",
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
              variant="destructive"
              onClick={handleLogout}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-2"
            >
              <Icon name="LogOut" size={20} />
              <span className="font-bold">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-4 text-white">Личный кабинет</h1>
              <p className="text-muted-foreground">Управляйте своим профилем игрока</p>
            </div>

            <div className="grid gap-6">
              <Card className="border-primary/30 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${user.is_organizer ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-primary to-secondary'} rounded-full clip-corner flex items-center justify-center text-2xl`}>
                        {user.is_organizer ? '👑' : user.nickname[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-black">{user.nickname}</div>
                          {user.is_organizer && <OrganizerBadge size="sm" variant="compact" />}
                          <UserStatusBadge status={(user as any).user_status || 'Новичок'} />
                        </div>
                        <div className="text-sm text-muted-foreground font-normal">{user.email}</div>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        onMouseEnter={playHoverSound}
                        variant="outline"
                        className="border-primary/30 hover:bg-primary/10"
                      >
                        <Icon name="Edit" size={18} className="mr-2" />
                        Редактировать
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Discord</div>
                          <div className="font-bold">{user.discord || 'Не указан'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Команда</div>
                          <div className="font-bold">{user.team || 'Нет команды'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Роль</div>
                        <div className="font-bold capitalize">{user.role}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Дата регистрации</div>
                        <div className="font-bold">{new Date(user.created_at).toLocaleDateString('ru-RU')}</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold mb-2 block">Никнейм</label>
                        <Input
                          value={formData.nickname}
                          onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                          required
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">Discord</label>
                        <Input
                          value={formData.discord}
                          onChange={(e) => setFormData({...formData, discord: e.target.value})}
                          placeholder="username#1234"
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">Команда</label>
                        <Input
                          value={formData.team}
                          onChange={(e) => setFormData({...formData, team: e.target.value})}
                          placeholder="Название команды"
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          type="submit"
                          disabled={loading}
                          onMouseEnter={playHoverSound}
                          className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
                        >
                          <Icon name="Save" className="mr-2" size={18} />
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button 
                          type="button"
                          onClick={() => {
                            playClickSound();
                            setIsEditing(false);
                            setFormData({
                              nickname: user.nickname,
                              discord: user.discord || '',
                              team: user.team || ''
                            });
                          }}
                          onMouseEnter={playHoverSound}
                          variant="outline"
                          className="border-primary/30 hover:bg-destructive/10"
                        >
                          Отмена
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Award" className="text-primary" size={24} />
                      Мои достижения
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-primary/10 text-primary border-primary/30">
                        <Icon name="Star" size={14} className="mr-1" />
                        {(user as any).achievement_points || 0} очков
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AchievementBadge
                      icon="👋"
                      name="Добро пожаловать!"
                      description="Зарегистрировался на платформе"
                      rarity="common"
                      unlocked={user.user_status !== undefined}
                      points={10}
                      unlockedAt={user.created_at}
                      size="sm"
                    />
                    <AchievementBadge
                      icon="🎮"
                      name="Первый турнир"
                      description="Зарегистрировался на первый турнир"
                      rarity="common"
                      unlocked={user.user_status === 'Игрок' || registrations.length > 0}
                      points={20}
                      size="sm"
                    />
                    <AchievementBadge
                      icon="⚔️"
                      name="Капитан команды"
                      description="Создал свою команду"
                      rarity="rare"
                      unlocked={!!team}
                      points={30}
                      size="sm"
                    />
                    <AchievementBadge
                      icon="🔥"
                      name="Первая кровь"
                      description="Одержи свою первую победу в турнире"
                      rarity="rare"
                      unlocked={false}
                      points={50}
                      size="sm"
                    />
                    <AchievementBadge
                      icon="💪"
                      name="Неудержимый"
                      description="Одержи 5 побед подряд"
                      rarity="epic"
                      unlocked={false}
                      points={100}
                      size="sm"
                    />
                    <AchievementBadge
                      icon="⚡"
                      name="Легенда"
                      description="Одержи 10 побед подряд"
                      rarity="epic"
                      unlocked={false}
                      points={150}
                      size="sm"
                    />
                  </div>
                  <div className="mt-6 pt-6 border-t border-primary/20 text-center">
                    <Button 
                      onClick={() => {
                        playClickSound();
                        navigate('/#achievements');
                      }}
                      onMouseEnter={playHoverSound}
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <Icon name="Grid" size={18} className="mr-2" />
                      Смотреть все достижения
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Users" className="text-primary" size={24} />
                      Моя команда
                    </div>
                    {!team && !loadingTeam && (
                      <Button 
                        onClick={() => {
                          playClickSound();
                          setShowCreateTeam(true);
                        }}
                        onMouseEnter={playHoverSound}
                        className="bg-gradient-to-r from-primary to-secondary"
                      >
                        <Icon name="Plus" size={18} className="mr-2" />
                        Создать команду
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingTeam ? (
                    <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
                  ) : team ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                        <div className="text-5xl">{team.logo_url}</div>
                        <div className="flex-1">
                          <div className="text-2xl font-black">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Капитан: {team.captain_nickname}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Игроков в составе: {team.roster?.length || 0}/7
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              playClickSound();
                              setShowEditTeam(true);
                            }}
                            onMouseEnter={playHoverSound}
                            variant="outline"
                            className="border-primary/30"
                          >
                            <Icon name="Edit" size={18} className="mr-2" />
                            Редактировать
                          </Button>
                          <Button
                            onClick={() => {
                              playClickSound();
                              setShowTeamManagement(!showTeamManagement);
                            }}
                            onMouseEnter={playHoverSound}
                            variant="outline"
                            className="border-primary/30"
                          >
                            <Icon name="Users" size={18} className="mr-2" />
                            {showTeamManagement ? 'Скрыть состав' : 'Состав'}
                          </Button>
                          <Button
                            onClick={() => {
                              playClickSound();
                              setShowDeleteTeam(true);
                            }}
                            onMouseEnter={playHoverSound}
                            variant="destructive"
                          >
                            <Icon name="Trash2" size={18} className="mr-2" />
                            Удалить
                          </Button>
                        </div>
                      </div>
                      
                      {showTeamManagement && (
                        <div className="mt-4">
                          <TeamManagement 
                            teamId={team.id} 
                            onUpdate={() => {
                              loadTeam();
                              toast({
                                title: "✅ Состав обновлен!",
                                description: "Изменения успешно сохранены",
                                className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
                              });
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Icon name="Users" size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="mb-4">У вас еще нет команды</p>
                      <p className="text-sm">Создайте команду, чтобы участвовать в турнирах</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {team && (
                <Card className="border-primary/30 bg-card/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon name="Trophy" className="text-secondary" size={24} />
                        Регистрация на турнир
                      </div>
                      <Button 
                        onClick={() => handleRegisterTournament('Winter Championship 2025')}
                        onMouseEnter={playHoverSound}
                        className="bg-gradient-to-r from-primary to-secondary"
                      >
                        <Icon name="Plus" size={18} className="mr-2" />
                        Зарегистрироваться
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {registrations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Зарегистрируйте команду на турнир, чтобы участвовать</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {registrations.map((reg) => (
                          <div key={reg.id} className="p-4 rounded-lg border border-primary/20 bg-card/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold">{reg.tournament_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Команда: {reg.team_name}
                                </div>
                              </div>
                              <Badge className={
                                reg.moderation_status === 'pending' 
                                  ? 'bg-yellow-500/20 text-yellow-500' 
                                  : reg.moderation_status === 'approved'
                                  ? 'bg-green-500/20 text-green-500'
                                  : 'bg-red-500/20 text-red-500'
                              }>
                                {reg.moderation_status === 'pending' && '⏳ На рассмотрении'}
                                {reg.moderation_status === 'approved' && '✅ Одобрено'}
                                {reg.moderation_status === 'rejected' && '❌ Отклонено'}
                              </Badge>
                            </div>
                            {reg.moderation_comment && (
                              <div className="mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                                {reg.moderation_comment}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <TournamentRegistrations tournamentName="Winter Championship 2025" />

              {user?.is_organizer && (
                <ModerationPanel tournamentName="Winter Championship 2025" />
              )}

              {(user as any)?.user_status === 'Главный администратор' && (
                <UserManagementPanel />
              )}
            </div>
          </div>
        </div>
      </section>

      <CreateTeamDialog 
        open={showCreateTeam} 
        onOpenChange={setShowCreateTeam}
        onSuccess={() => {
          loadTeam();
          toast({
            title: "✅ Команда создана!",
            description: "Теперь вы можете регистрироваться на турниры",
            className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
          });
        }}
      />

      {team && (
        <EditTeamDialog 
          open={showEditTeam} 
          onOpenChange={setShowEditTeam}
          team={team}
          onSuccess={() => {
            loadTeam();
            toast({
              title: "✅ Команда обновлена!",
              description: "Изменения успешно сохранены",
              className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
            });
          }}
        />
      )}

      {team && (
        <DeleteTeamDialog
          open={showDeleteTeam}
          onOpenChange={setShowDeleteTeam}
          teamName={team.name}
          onDelete={handleDeleteTeam}
        />
      )}
    </div>
  );
};

export default Profile;