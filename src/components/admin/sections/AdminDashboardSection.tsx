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
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">Главная Панель</h1>
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          <Icon name={loading ? "Loader2" : "RefreshCw"} size={18} className={loading ? "animate-spin" : ""} />
          {loading ? 'Обновление...' : 'Обновить'}
        </button>
      </div>
      
      {loading && stats.total_users === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="p-4 md:p-6 space-y-2 hover:shadow-lg transition-all hover:border-primary/50">
              <Icon name="Users" size={28} className="text-primary" />
              <h3 className="text-xl md:text-2xl font-bold">{stats.total_users}</h3>
              <p className="text-sm text-muted-foreground">Всего пользователей</p>
            </Card>
            
            <Card className="p-4 md:p-6 space-y-2 hover:shadow-lg transition-all hover:border-secondary/50">
              <Icon name="Trophy" size={28} className="text-secondary" />
              <h3 className="text-xl md:text-2xl font-bold">{stats.active_tournaments}</h3>
              <p className="text-sm text-muted-foreground">Активных турниров</p>
            </Card>
            
            <Card className="p-4 md:p-6 space-y-2 hover:shadow-lg transition-all hover:border-accent/50">
              <Icon name="Newspaper" size={28} className="text-accent" />
              <h3 className="text-xl md:text-2xl font-bold">{stats.published_news}</h3>
              <p className="text-sm text-muted-foreground">Опубликовано новостей</p>
            </Card>

            <Card className="p-4 md:p-6 space-y-2 hover:shadow-lg transition-all hover:border-red-500/50">
              <Icon name="Ban" size={28} className="text-red-500" />
              <h3 className="text-xl md:text-2xl font-bold">{stats.active_bans}</h3>
              <p className="text-sm text-muted-foreground">Активных банов</p>
            </Card>

            <Card className="p-4 md:p-6 space-y-2 hover:shadow-lg transition-all hover:border-orange-500/50">
              <Icon name="VolumeX" size={28} className="text-orange-500" />
              <h3 className="text-xl md:text-2xl font-bold">{stats.active_mutes}</h3>
              <p className="text-sm text-muted-foreground">Активных мутов</p>
            </Card>

            <Card className="p-4 md:p-6 space-y-2 hover:shadow-lg transition-all hover:border-purple-500/50">
              <Icon name="Shield" size={28} className="text-purple-500" />
              <h3 className="text-xl md:text-2xl font-bold">{stats.total_teams}</h3>
              <p className="text-sm text-muted-foreground">Всего команд</p>
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