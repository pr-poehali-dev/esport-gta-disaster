import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function AdminSettingsSection() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = ['founder', 'organizer'].includes(user.role);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_settings' }),
      });

      const data = await response.json();
      if (data.settings) {
        const settingsObj: Record<string, any> = {};
        data.settings.forEach((s: any) => {
          settingsObj[s.key] = s.value;
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    if (!canEdit) {
      toast({
        title: 'Ошибка',
        description: 'У вас нет прав на изменение настроек',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'update_setting',
          key,
          value,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadSettings();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить настройку',
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

  const handleToggle = (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    updateSetting(key, newValue);
  };

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-bold">Настройки</h1>
        <Card>
          <CardHeader>
            <CardTitle>Доступ запрещен</CardTitle>
            <CardDescription>Только основатель или организатор может изменять настройки</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">У вас нет прав для просмотра этого раздела.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Icon name="Settings" size={36} />
          Настройки сайта
        </h1>
        <p className="text-muted-foreground mt-2">Глобальные настройки, которые применяются ко всему сайту</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Общая информация</CardTitle>
          <CardDescription>Основные данные о сайте</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Название сайта</Label>
            <div className="flex gap-2">
              <Input
                id="siteName"
                value={settings.site_name || ''}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="Название сайта"
              />
              <Button onClick={() => updateSetting('site_name', settings.site_name)} disabled={loading}>
                <Icon name="Save" size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Описание</Label>
            <div className="flex gap-2">
              <Input
                id="siteDescription"
                value={settings.site_description || ''}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                placeholder="Описание сайта"
              />
              <Button onClick={() => updateSetting('site_description', settings.site_description)} disabled={loading}>
                <Icon name="Save" size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Функциональность</CardTitle>
          <CardDescription>Включение/отключение различных возможностей</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base">Регистрация пользователей</Label>
              <p className="text-sm text-muted-foreground">Разрешить новым пользователям регистрироваться на сайте</p>
            </div>
            <Switch
              checked={settings.registration_enabled === 'true'}
              onCheckedChange={() => handleToggle('registration_enabled', settings.registration_enabled)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base">Создание турниров</Label>
              <p className="text-sm text-muted-foreground">Разрешить пользователям создавать турниры</p>
            </div>
            <Switch
              checked={settings.tournament_creation_enabled === 'true'}
              onCheckedChange={() => handleToggle('tournament_creation_enabled', settings.tournament_creation_enabled)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label className="text-base">Режим обслуживания</Label>
              <p className="text-sm text-muted-foreground text-red-500">Включите для технических работ (сайт будет недоступен)</p>
            </div>
            <Switch
              checked={settings.maintenance_mode === 'true'}
              onCheckedChange={() => handleToggle('maintenance_mode', settings.maintenance_mode)}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Параметры турниров</CardTitle>
          <CardDescription>Настройки для турнирной системы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxTeamSize">Максимальный размер команды</Label>
            <div className="flex gap-2">
              <Input
                id="maxTeamSize"
                type="number"
                value={settings.max_team_size || ''}
                onChange={(e) => setSettings({ ...settings, max_team_size: e.target.value })}
                placeholder="5"
              />
              <Button onClick={() => updateSetting('max_team_size', settings.max_team_size)} disabled={loading}>
                <Icon name="Save" size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultFormat">Формат турниров по умолчанию</Label>
            <div className="flex gap-2">
              <Input
                id="defaultFormat"
                value={settings.default_tournament_format || ''}
                onChange={(e) => setSettings({ ...settings, default_tournament_format: e.target.value })}
                placeholder="5v5"
              />
              <Button onClick={() => updateSetting('default_tournament_format', settings.default_tournament_format)} disabled={loading}>
                <Icon name="Save" size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-yellow-500/10 border-yellow-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <Icon name="AlertTriangle" size={20} />
            Важно
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">• Изменения настроек применяются ко всему сайту мгновенно</p>
          <p className="text-sm">• Режим обслуживания закроет доступ для всех пользователей кроме администраторов</p>
          <p className="text-sm">• Отключение регистрации не даст новым пользователям создавать аккаунты</p>
        </CardContent>
      </Card>
    </div>
  );
}
