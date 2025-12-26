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

  useEffect(() => {
    loadProfile();
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
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full clip-corner flex items-center justify-center text-2xl">
                        {user.nickname[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-2xl font-black">{user.nickname}</div>
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
                        245 очков
                      </Badge>
                      <Badge className="bg-secondary/10 text-secondary border-secondary/30">
                        4/10 получено
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AchievementBadge
                      icon="⚔️"
                      name="Первая кровь"
                      description="Одержи свою первую победу в турнире"
                      rarity="common"
                      unlocked={true}
                      points={10}
                      unlockedAt="2025-01-15T10:30:00Z"
                      size="sm"
                    />
                    <AchievementBadge
                      icon="🔥"
                      name="Неудержимый"
                      description="Одержи 5 побед подряд"
                      rarity="rare"
                      unlocked={true}
                      points={50}
                      unlockedAt="2025-01-18T14:20:00Z"
                      size="sm"
                    />
                    <AchievementBadge
                      icon="💎"
                      name="Безупречная игра"
                      description="Выиграй матч со счетом 3:0"
                      rarity="rare"
                      unlocked={true}
                      points={30}
                      unlockedAt="2025-01-16T16:45:00Z"
                      size="sm"
                    />
                    <AchievementBadge
                      icon="🎮"
                      name="Первый турнир"
                      description="Зарегистрируйся на свой первый турнир"
                      rarity="common"
                      unlocked={true}
                      points={5}
                      unlockedAt="2025-01-10T09:00:00Z"
                      size="sm"
                    />
                    <AchievementBadge
                      icon="⚡"
                      name="Легенда"
                      description="Одержи 10 побед подряд"
                      rarity="epic"
                      unlocked={false}
                      progress={7}
                      maxProgress={10}
                      points={100}
                      size="sm"
                    />
                    <AchievementBadge
                      icon="👑"
                      name="Король камбэков"
                      description="Выиграй матч, проигрывая 0:2"
                      rarity="epic"
                      unlocked={false}
                      progress={0}
                      maxProgress={1}
                      points={75}
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
                  <CardTitle className="flex items-center gap-3">
                    <Icon name="Trophy" className="text-secondary" size={24} />
                    Мои турниры
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Icon name="Trophy" size={48} className="mx-auto mb-4 opacity-30" />
                    <p>Вы еще не зарегистрированы на турниры</p>
                    <Button 
                      onClick={() => {
                        playClickSound();
                        navigate('/#register');
                      }}
                      onMouseEnter={playHoverSound}
                      className="mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    >
                      Зарегистрироваться
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;