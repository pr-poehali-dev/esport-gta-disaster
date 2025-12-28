import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function AdminSupportSection() {
  const [supportData, setSupportData] = useState<any>({ email: '', telegram: '', discord: '', vk: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadSupport();
  }, []);

  const loadSupport = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_support' }),
      });

      const data = await response.json();
      if (data.support) {
        setSupportData({
          email: data.support.email || '',
          telegram: data.support.telegram || '',
          discord: data.support.discord || '',
          vk: data.support.vk || '',
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки данных поддержки:', error);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'update_support',
          ...supportData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadSupport();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить контакты',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Icon name="Headset" size={36} />
          Поддержка
        </h1>
        <p className="text-muted-foreground mt-2">Контакты службы поддержки, которые видят пользователи</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Контактная информация</CardTitle>
          <CardDescription>Эти данные отображаются на странице поддержки сайта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Icon name="Mail" size={16} />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={supportData.email}
                onChange={(e) => setSupportData({ ...supportData, email: e.target.value })}
                placeholder="support@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram" className="flex items-center gap-2">
                <Icon name="Send" size={16} />
                Telegram
              </Label>
              <Input
                id="telegram"
                value={supportData.telegram}
                onChange={(e) => setSupportData({ ...supportData, telegram: e.target.value })}
                placeholder="@support_bot или https://t.me/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discord" className="flex items-center gap-2">
                <Icon name="MessageCircle" size={16} />
                Discord
              </Label>
              <Input
                id="discord"
                value={supportData.discord}
                onChange={(e) => setSupportData({ ...supportData, discord: e.target.value })}
                placeholder="https://discord.gg/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vk" className="flex items-center gap-2">
                <Icon name="Users" size={16} />
                VK
              </Label>
              <Input
                id="vk"
                value={supportData.vk}
                onChange={(e) => setSupportData({ ...supportData, vk: e.target.value })}
                placeholder="https://vk.com/..."
              />
            </div>
          </div>

          <Button onClick={handleUpdate} disabled={loading} size="lg">
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить изменения
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Info" size={20} />
            Информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            • Контакты отображаются на странице <strong>/support</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            • Пользователи смогут связаться с вами через указанные каналы
          </p>
          <p className="text-sm text-muted-foreground">
            • Рекомендуется указать хотя бы один способ связи
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
