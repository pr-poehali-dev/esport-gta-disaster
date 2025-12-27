import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function AdminSuspensionsSection() {
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
        <h1 className="text-4xl font-bold">Отстранения от турниров</h1>
        <Button onClick={loadExclusions} variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : exclusions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Нет отстранений</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold">Пользователь</th>
                  <th className="text-left p-4 font-semibold">Турнир</th>
                  <th className="text-left p-4 font-semibold">Администратор</th>
                  <th className="text-left p-4 font-semibold">Причина</th>
                  <th className="text-left p-4 font-semibold">Дата</th>
                </tr>
              </thead>
              <tbody>
                {exclusions.map((exclusion: any) => (
                  <tr key={exclusion.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4 font-medium">{exclusion.username}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-500 rounded text-sm">
                        {exclusion.tournament_name}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{exclusion.admin_name}</td>
                    <td className="p-4">{exclusion.reason}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(exclusion.exclusion_date).toLocaleDateString('ru-RU')}
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
