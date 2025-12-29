import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { getAdminId } from '@/lib/auth';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Stats {
  total_users: number;
  active_tournaments: number;
  published_news: number;
  active_bans: number;
  active_mutes: number;
  total_teams: number;
}

export function AdminDashboardSection() {
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    active_tournaments: 0,
    published_news: 0,
    active_bans: 0,
    active_mutes: 0,
    total_teams: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const adminId = getAdminId();

    if (!adminId) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить ID администратора',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({ action: 'get_dashboard_stats' }),
      });

      const data = await response.json();
      if (response.ok) {
        setStats(data.stats || stats);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Главная Панель</h1>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Icon name="Users" size={32} className="text-primary" />
              <h3 className="text-2xl font-bold">{stats.total_users}</h3>
              <p className="text-muted-foreground">Всего пользователей</p>
            </Card>
            
            <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Icon name="Trophy" size={32} className="text-secondary" />
              <h3 className="text-2xl font-bold">{stats.active_tournaments}</h3>
              <p className="text-muted-foreground">Активных турниров</p>
            </Card>
            
            <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Icon name="Newspaper" size={32} className="text-accent" />
              <h3 className="text-2xl font-bold">{stats.published_news}</h3>
              <p className="text-muted-foreground">Опубликовано новостей</p>
            </Card>

            <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Icon name="Ban" size={32} className="text-red-500" />
              <h3 className="text-2xl font-bold">{stats.active_bans}</h3>
              <p className="text-muted-foreground">Активных банов</p>
            </Card>

            <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Icon name="VolumeX" size={32} className="text-orange-500" />
              <h3 className="text-2xl font-bold">{stats.active_mutes}</h3>
              <p className="text-muted-foreground text-sm">Активных мутов</p>
            </Card>

            <Card className="p-6 space-y-2 hover:shadow-lg transition-shadow">
              <Icon name="Shield" size={32} className="text-purple-500" />
              <h3 className="text-2xl font-bold">{stats.total_teams}</h3>
              <p className="text-muted-foreground text-sm">Всего команд</p>
            </Card>
          </div>

          <Card className="p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Последние действия</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>• Статистика обновлена</p>
              <p>• Все системы работают в штатном режиме</p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}