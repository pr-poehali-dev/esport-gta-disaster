import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ activeSection, setActiveSection, onLogout }: AdminSidebarProps) {
  return (
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
          onClick={onLogout}
        >
          <Icon name="LogOut" size={20} className="mr-2" />
          Выйти
        </Button>
      </div>
    </aside>
  );
}
