import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function DashboardSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Главная Панель</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <Icon name="Users" size={32} className="text-primary" />
          <h3 className="text-2xl font-bold">247</h3>
          <p className="text-muted-foreground">Всего пользователей</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="Trophy" size={32} className="text-secondary" />
          <h3 className="text-2xl font-bold">12</h3>
          <p className="text-muted-foreground">Активных турниров</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="Newspaper" size={32} className="text-accent" />
          <h3 className="text-2xl font-bold">45</h3>
          <p className="text-muted-foreground">Опубликовано новостей</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Последние действия</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Icon name="UserPlus" size={24} className="text-primary" />
            <div>
              <p className="font-semibold">Новый пользователь</p>
              <p className="text-sm text-muted-foreground">Player123 зарегистрировался</p>
            </div>
            <span className="ml-auto text-sm text-muted-foreground">5 мин назад</span>
          </div>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Icon name="Trophy" size={24} className="text-secondary" />
            <div>
              <p className="font-semibold">Новый турнир</p>
              <p className="text-sm text-muted-foreground">CS2 Championship 2025 создан</p>
            </div>
            <span className="ml-auto text-sm text-muted-foreground">1 час назад</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function UsersSection() {
  const mockUsers = [
    { id: 1, username: 'ProGamer', email: 'progamer@example.com', role: 'Пользователь', status: 'Активен' },
    { id: 2, username: 'TeamLead', email: 'lead@example.com', role: 'Капитан', status: 'Активен' },
    { id: 3, username: 'AdminUser', email: 'admin@example.com', role: 'Администратор', status: 'Активен' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Пользователями</h1>
        <Button>
          <Icon name="UserPlus" size={20} className="mr-2" />
          Добавить пользователя
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Поиск по username или email..." className="flex-1" />
        <Button variant="outline">
          <Icon name="Search" size={20} />
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Username</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Роль</th>
                <th className="text-left p-4 font-semibold">Статус</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-sm">
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Icon name="Ban" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function BansSection() {
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getAdminId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    loadBans();
  }, []);

  const loadBans = async () => {
    setLoading(true);
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({ action: 'get_bans' }),
      });

      const data = await response.json();
      if (response.ok) {
        setBans(data.bans || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список банов',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (userId: number) => {
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'remove_ban',
          user_id: userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Бан снят',
        });
        loadBans();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось снять бан',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (startDate: string, endDate: string | null, isPermanent: boolean) => {
    if (isPermanent) return 'Навсегда';
    if (!endDate) return 'Неизвестно';
    
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Истек';
    return `${diffDays} дн.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Бан-лист</h1>
        <Button onClick={loadBans} variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : bans.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Нет активных банов</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold">Username</th>
                  <th className="text-left p-4 font-semibold">Дата бана</th>
                  <th className="text-left p-4 font-semibold">Кем выдан</th>
                  <th className="text-left p-4 font-semibold">Причина</th>
                  <th className="text-left p-4 font-semibold">Срок</th>
                  <th className="text-left p-4 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {bans.map((ban: any) => (
                  <tr key={ban.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4">
                      <a href={`/profile?user=${ban.username}`} className="font-medium text-primary hover:underline">
                        {ban.username}
                      </a>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(ban.ban_start_date).toLocaleString('ru-RU')}
                    </td>
                    <td className="p-4">{ban.admin_name}</td>
                    <td className="p-4">{ban.reason}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          ban.is_permanent
                            ? 'bg-destructive/20 text-destructive'
                            : 'bg-orange-500/20 text-orange-500'
                        }`}
                      >
                        {formatDuration(ban.ban_start_date, ban.ban_end_date, ban.is_permanent)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" onClick={() => handleUnban(ban.user_id)}>
                        <Icon name="UserCheck" size={16} className="mr-2" />
                        Разбанить
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function MutesSection() {
  const [mutes, setMutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getAdminId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    loadMutes();
  }, []);

  const loadMutes = async () => {
    setLoading(true);
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({ action: 'get_mutes' }),
      });

      const data = await response.json();
      if (response.ok) {
        setMutes(data.mutes || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список мутов',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnmute = async (userId: number) => {
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'remove_mute',
          user_id: userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Мут снят',
        });
        loadMutes();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось снять мут',
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (startDate: string, endDate: string | null, isPermanent: boolean) => {
    if (isPermanent) return 'Навсегда';
    if (!endDate) return 'Неизвестно';
    
    const end = new Date(endDate);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Истек';
    return `${diffDays} дн.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Мут-лист в Обсуждениях</h1>
        <Button onClick={loadMutes} variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : mutes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Нет активных мутов</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold">Username</th>
                  <th className="text-left p-4 font-semibold">Дата мута</th>
                  <th className="text-left p-4 font-semibold">Кем выдан</th>
                  <th className="text-left p-4 font-semibold">Причина</th>
                  <th className="text-left p-4 font-semibold">Срок</th>
                  <th className="text-left p-4 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {mutes.map((mute: any) => (
                  <tr key={mute.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4">
                      <a href={`/profile?user=${mute.username}`} className="font-medium text-primary hover:underline">
                        {mute.username}
                      </a>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(mute.mute_start_date).toLocaleString('ru-RU')}
                    </td>
                    <td className="p-4">{mute.admin_name}</td>
                    <td className="p-4">{mute.reason}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded text-sm">
                        {formatDuration(mute.mute_start_date, mute.mute_end_date, mute.is_permanent)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" onClick={() => handleUnmute(mute.user_id)}>
                        <Icon name="Volume2" size={16} className="mr-2" />
                        Снять мут
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function SuspensionsSection() {
  const [exclusions, setExclusions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getAdminId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    loadExclusions();
  }, []);

  const loadExclusions = async () => {
    setLoading(true);
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({ action: 'get_exclusions' }),
      });

      const data = await response.json();
      if (response.ok) {
        setExclusions(data.exclusions || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список отстранений',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Отстранения от Турниров</h1>
        <Button onClick={loadExclusions} variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : exclusions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Нет активных отстранений</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold">Username</th>
                  <th className="text-left p-4 font-semibold">Турнир</th>
                  <th className="text-left p-4 font-semibold">Причина</th>
                  <th className="text-left p-4 font-semibold">Дата отстранения</th>
                  <th className="text-left p-4 font-semibold">Кем выдано</th>
                </tr>
              </thead>
              <tbody>
                {exclusions.map((exclusion: any) => (
                  <tr key={exclusion.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4">
                      <a href={`/profile?user=${exclusion.username}`} className="font-medium text-primary hover:underline">
                        {exclusion.username}
                      </a>
                    </td>
                    <td className="p-4">
                      <span className="text-secondary">{exclusion.tournament_name}</span>
                    </td>
                    <td className="p-4">{exclusion.reason}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(exclusion.exclusion_date).toLocaleString('ru-RU')}
                    </td>
                    <td className="p-4 text-muted-foreground">{exclusion.admin_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function ContentSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Управление Контентом</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <Icon name="Newspaper" size={32} className="text-primary" />
          <h3 className="text-xl font-bold">Новости</h3>
          <p className="text-muted-foreground">Создание и редактирование новостей</p>
          <Button className="w-full">Управлять новостями</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <Icon name="Trophy" size={32} className="text-secondary" />
          <h3 className="text-xl font-bold">Турниры</h3>
          <p className="text-muted-foreground">Создание и управление турнирами</p>
          <Button className="w-full">Управлять турнирами</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <Icon name="FileText" size={32} className="text-accent" />
          <h3 className="text-xl font-bold">Правила</h3>
          <p className="text-muted-foreground">Редактирование правил турниров</p>
          <Button className="w-full">Редактировать правила</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <Icon name="HelpCircle" size={32} className="text-primary" />
          <h3 className="text-xl font-bold">FAQ</h3>
          <p className="text-muted-foreground">Управление часто задаваемыми вопросами</p>
          <Button className="w-full">Редактировать FAQ</Button>
        </Card>
      </div>
    </div>
  );
}

export function TournamentsSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Турнирами</h1>
        <Button>
          <Icon name="Plus" size={20} className="mr-2" />
          Создать турнир
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground">Здесь будет форма создания и редактирования турниров</p>
      </Card>
    </div>
  );
}

export function NewsSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Новостями</h1>
        <Button>
          <Icon name="Plus" size={20} className="mr-2" />
          Создать новость
        </Button>
      </div>

      <Card className="p-6">
        <p className="text-muted-foreground">Здесь будет список новостей с возможностью редактирования</p>
      </Card>
    </div>
  );
}

export function ModerationSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Модерация Обсуждений</h1>

      <Card className="p-6">
        <p className="text-muted-foreground">Здесь будут отображаться темы и комментарии для модерации</p>
      </Card>
    </div>
  );
}

export function SupportSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Запросы в Поддержку</h1>

      <Card className="p-6">
        <p className="text-muted-foreground">Здесь будут отображаться запросы в поддержку</p>
      </Card>
    </div>
  );
}

export function SettingsSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Настройки Сайта</h1>

      <Card className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Название сайта</label>
          <Input defaultValue="Disaster Esports" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Email для уведомлений</label>
          <Input defaultValue="admin@disasteresports.com" />
        </div>
        <Button>Сохранить настройки</Button>
      </Card>
    </div>
  );
}