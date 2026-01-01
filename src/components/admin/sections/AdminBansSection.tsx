import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function AdminBansSection() {
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
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">Бан-лист</h1>
        <Button onClick={loadBans} variant="outline" size="sm">
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Обновить
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Icon name="Loader2" className="animate-spin" size={20} />
            Загрузка...
          </div>
        ) : bans.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" className="mx-auto mb-2 text-green-500" size={40} />
            <p className="text-muted-foreground">Нет активных банов</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Пользователь</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Администратор</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Причина</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Дата</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Срок</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {bans.map((ban: any) => (
                  <tr key={ban.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="p-3 md:p-4 font-medium">{ban.username}</td>
                    <td className="p-3 md:p-4 text-sm text-muted-foreground">{ban.admin_name}</td>
                    <td className="p-3 md:p-4 text-sm max-w-xs truncate" title={ban.reason}>{ban.reason}</td>
                    <td className="p-3 md:p-4 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(ban.ban_start_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-3 md:p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap inline-block ${
                        ban.is_permanent 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {formatDuration(ban.ban_start_date, ban.ban_end_date, ban.is_permanent)}
                      </span>
                    </td>
                    <td className="p-3 md:p-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnban(ban.user_id)}
                        className="whitespace-nowrap"
                      >
                        <Icon name="UserCheck" size={14} className="mr-1" />
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