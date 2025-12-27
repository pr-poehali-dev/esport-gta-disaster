import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = 'disaster2025admin';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать в админ-панель',
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <Icon name="Shield" size={48} className="mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Админ-Панель</h1>
            <p className="text-muted-foreground">Введите административный пароль</p>
          </div>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="text-center"
            />
            <Button onClick={handleLogin} className="w-full">
              <Icon name="LogIn" size={20} className="mr-2" />
              Войти
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Вернуться на главную
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex">
        <aside className="w-64 bg-card border-r border-border p-4 space-y-2">
          <h2 className="text-xl font-bold mb-6 px-4">Навигация</h2>
          
          <Button
            variant={activeSection === 'dashboard' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveSection('dashboard')}
          >
            <Icon name="LayoutDashboard" size={20} className="mr-2" />
            Главная
          </Button>

          <div className="pt-4">
            <p className="text-xs text-muted-foreground px-4 mb-2">УПРАВЛЕНИЕ</p>
            <Button
              variant={activeSection === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('users')}
            >
              <Icon name="Users" size={20} className="mr-2" />
              Пользователи
            </Button>
            <Button
              variant={activeSection === 'bans' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('bans')}
            >
              <Icon name="Ban" size={20} className="mr-2" />
              Бан-лист
            </Button>
            <Button
              variant={activeSection === 'mutes' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('mutes')}
            >
              <Icon name="VolumeX" size={20} className="mr-2" />
              Мут-лист
            </Button>
            <Button
              variant={activeSection === 'suspensions' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('suspensions')}
            >
              <Icon name="UserX" size={20} className="mr-2" />
              Отстранения
            </Button>
          </div>

          <div className="pt-4">
            <p className="text-xs text-muted-foreground px-4 mb-2">КОНТЕНТ</p>
            <Button
              variant={activeSection === 'content' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('content')}
            >
              <Icon name="FileText" size={20} className="mr-2" />
              Контент
            </Button>
            <Button
              variant={activeSection === 'tournaments' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('tournaments')}
            >
              <Icon name="Trophy" size={20} className="mr-2" />
              Турниры
            </Button>
            <Button
              variant={activeSection === 'news' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('news')}
            >
              <Icon name="Newspaper" size={20} className="mr-2" />
              Новости
            </Button>
          </div>

          <div className="pt-4">
            <p className="text-xs text-muted-foreground px-4 mb-2">ПРОЧЕЕ</p>
            <Button
              variant={activeSection === 'moderation' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('moderation')}
            >
              <Icon name="Shield" size={20} className="mr-2" />
              Модерация
            </Button>
            <Button
              variant={activeSection === 'support' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('support')}
            >
              <Icon name="MessageSquare" size={20} className="mr-2" />
              Поддержка
            </Button>
            <Button
              variant={activeSection === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveSection('settings')}
            >
              <Icon name="Settings" size={20} className="mr-2" />
              Настройки
            </Button>
          </div>

          <div className="pt-4">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                setIsAuthenticated(false);
                setPassword('');
                toast({
                  title: 'Выход выполнен',
                  description: 'Вы вышли из админ-панели',
                });
              }}
            >
              <Icon name="LogOut" size={20} className="mr-2" />
              Выйти
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'bans' && <BansSection />}
          {activeSection === 'mutes' && <MutesSection />}
          {activeSection === 'suspensions' && <SuspensionsSection />}
          {activeSection === 'content' && <ContentSection />}
          {activeSection === 'tournaments' && <TournamentsSection />}
          {activeSection === 'news' && <NewsSection />}
          {activeSection === 'moderation' && <ModerationSection />}
          {activeSection === 'support' && <SupportSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

function DashboardSection() {
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

function UsersSection() {
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

function BansSection() {
  const mockBans = [
    {
      id: 1,
      username: 'ToxicPlayer',
      bannedAt: '2025-01-15 14:30',
      bannedBy: 'AdminUser',
      reason: 'Токсичное поведение в чате',
      duration: '7 дней',
    },
    {
      id: 2,
      username: 'Cheater123',
      bannedAt: '2025-01-10 09:15',
      bannedBy: 'ModeratorX',
      reason: 'Использование читов в турнире',
      duration: 'Навсегда',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Бан-лист</h1>
        <Button>
          <Icon name="Ban" size={20} className="mr-2" />
          Выдать бан
        </Button>
      </div>

      <Card>
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
              {mockBans.map((ban) => (
                <tr key={ban.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4">
                    <a href="#" className="font-medium text-primary hover:underline">
                      {ban.username}
                    </a>
                  </td>
                  <td className="p-4 text-muted-foreground">{ban.bannedAt}</td>
                  <td className="p-4">{ban.bannedBy}</td>
                  <td className="p-4">{ban.reason}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        ban.duration === 'Навсегда'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-orange-500/20 text-orange-500'
                      }`}
                    >
                      {ban.duration}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">
                      <Icon name="UserCheck" size={16} className="mr-2" />
                      Разбанить
                    </Button>
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

function MutesSection() {
  const mockMutes = [
    {
      id: 1,
      username: 'SpammerPro',
      mutedAt: '2025-01-20 16:45',
      mutedBy: 'ModeratorY',
      reason: 'Спам в обсуждениях',
      duration: '3 дня',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Мут-лист в Обсуждениях</h1>
        <Button>
          <Icon name="VolumeX" size={20} className="mr-2" />
          Выдать мут
        </Button>
      </div>

      <Card>
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
              {mockMutes.map((mute) => (
                <tr key={mute.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4">
                    <a href="#" className="font-medium text-primary hover:underline">
                      {mute.username}
                    </a>
                  </td>
                  <td className="p-4 text-muted-foreground">{mute.mutedAt}</td>
                  <td className="p-4">{mute.mutedBy}</td>
                  <td className="p-4">{mute.reason}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-500 rounded text-sm">
                      {mute.duration}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">
                      <Icon name="Volume2" size={16} className="mr-2" />
                      Снять мут
                    </Button>
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

function SuspensionsSection() {
  const mockSuspensions = [
    {
      id: 1,
      username: 'RuleBreaker',
      tournament: 'CS2 Championship 2025',
      reason: 'Нарушение правил турнира',
      date: '2025-01-18 12:00',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Отстранения от Турниров</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Username</th>
                <th className="text-left p-4 font-semibold">Турнир</th>
                <th className="text-left p-4 font-semibold">Причина</th>
                <th className="text-left p-4 font-semibold">Дата отстранения</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockSuspensions.map((suspension) => (
                <tr key={suspension.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4">
                    <a href="#" className="font-medium text-primary hover:underline">
                      {suspension.username}
                    </a>
                  </td>
                  <td className="p-4">
                    <a href="#" className="text-secondary hover:underline">
                      {suspension.tournament}
                    </a>
                  </td>
                  <td className="p-4">{suspension.reason}</td>
                  <td className="p-4 text-muted-foreground">{suspension.date}</td>
                  <td className="p-4">
                    <Button size="sm" variant="outline">
                      <Icon name="UserPlus" size={16} className="mr-2" />
                      Вернуть в турнир
                    </Button>
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

function ContentSection() {
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

function TournamentsSection() {
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

function NewsSection() {
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

function ModerationSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Модерация Обсуждений</h1>

      <Card className="p-6">
        <p className="text-muted-foreground">Здесь будут отображаться темы и комментарии для модерации</p>
      </Card>
    </div>
  );
}

function SupportSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Запросы в Поддержку</h1>

      <Card className="p-6">
        <p className="text-muted-foreground">Здесь будут отображаться запросы в поддержку</p>
      </Card>
    </div>
  );
}

function SettingsSection() {
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
