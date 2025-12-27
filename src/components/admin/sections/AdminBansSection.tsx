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
                  <th className="text-left p-4 font-semibold">Пользователь</th>
                  <th className="text-left p-4 font-semibold">Администратор</th>
                  <th className="text-left p-4 font-semibold">Причина</th>
                  <th className="text-left p-4 font-semibold">Дата бана</th>
                  <th className="text-left p-4 font-semibold">Длительность</th>
                  <th className="text-left p-4 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {bans.map((ban: any) => (
                  <tr key={ban.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4 font-medium">{ban.username}</td>
                    <td className="p-4 text-muted-foreground">{ban.admin_name}</td>
                    <td className="p-4">{ban.reason}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(ban.ban_start_date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        ban.is_permanent 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {formatDuration(ban.ban_start_date, ban.ban_end_date, ban.is_permanent)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnban(ban.user_id)}
                      >
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
