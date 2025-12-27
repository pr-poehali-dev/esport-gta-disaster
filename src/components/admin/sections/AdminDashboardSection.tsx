import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export function AdminDashboardSection() {
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
