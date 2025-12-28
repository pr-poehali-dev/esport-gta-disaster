import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function AdminModerationSection() {
  const [logs, setLogs] = useState<any[]>([]);
  const [activeBans, setActiveBans] = useState<any[]>([]);
  const [activeMutes, setActiveMutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadLogs(), loadBans(), loadMutes()]);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_moderation_logs' }),
      });

      const data = await response.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Ошибка загрузки логов:', error);
    }
  };

  const loadBans = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_active_bans' }),
      });

      const data = await response.json();
      if (data.bans) {
        setActiveBans(data.bans);
      }
    } catch (error) {
      console.error('Ошибка загрузки банов:', error);
    }
  };

  const loadMutes = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_active_mutes' }),
      });

      const data = await response.json();
      if (data.mutes) {
        setActiveMutes(data.mutes);
      }
    } catch (error) {
      console.error('Ошибка загрузки мутов:', error);
    }
  };

  const handleToggleBan = async (banId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'update_ban_status',
          ban_id: banId,
          is_active: !currentStatus,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadBans();
        loadLogs();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggleMute = async (muteId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'update_mute_status',
          mute_id: muteId,
          is_active: !currentStatus,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadMutes();
        loadLogs();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'ban': return <Icon name="Ban" size={16} className="text-red-500" />;
      case 'mute': return <Icon name="VolumeX" size={16} className="text-orange-500" />;
      case 'tournament_exclusion': return <Icon name="Trophy" size={16} className="text-yellow-500" />;
      case 'ban_status_updated': return <Icon name="RefreshCw" size={16} className="text-blue-500" />;
      case 'mute_status_updated': return <Icon name="RefreshCw" size={16} className="text-blue-500" />;
      default: return <Icon name="Info" size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Icon name="Shield" size={36} />
            Модерация
          </h1>
          <p className="text-muted-foreground mt-2">Управление банами, мутами и логами действий</p>
        </div>
        <Button onClick={loadAllData} disabled={loading} variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <Icon name="Ban" size={32} className="text-red-500" />
          <h3 className="text-2xl font-bold">{activeBans.length}</h3>
          <p className="text-muted-foreground">Активных банов</p>
        </Card>

        <Card className="p-6 space-y-2">
          <Icon name="VolumeX" size={32} className="text-orange-500" />
          <h3 className="text-2xl font-bold">{activeMutes.length}</h3>
          <p className="text-muted-foreground">Активных мутов</p>
        </Card>

        <Card className="p-6 space-y-2">
          <Icon name="FileText" size={32} className="text-blue-500" />
          <h3 className="text-2xl font-bold">{logs.length}</h3>
          <p className="text-muted-foreground">Записей в логах</p>
        </Card>
      </div>

      <Tabs defaultValue="bans" className="w-full">
        <TabsList>
          <TabsTrigger value="bans">Баны ({activeBans.length})</TabsTrigger>
          <TabsTrigger value="mutes">Муты ({activeMutes.length})</TabsTrigger>
          <TabsTrigger value="logs">Логи ({logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="bans">
          <Card>
            <CardHeader>
              <CardTitle>Активные баны</CardTitle>
              <CardDescription>Управление банами пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Нет активных банов</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-semibold">Пользователь</th>
                        <th className="text-left p-4 font-semibold">Причина</th>
                        <th className="text-left p-4 font-semibold">Забанил</th>
                        <th className="text-left p-4 font-semibold">Истекает</th>
                        <th className="text-left p-4 font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeBans.map((ban) => (
                        <tr key={ban.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-4 font-medium">{ban.username || `ID: ${ban.user_id}`}</td>
                          <td className="p-4 text-muted-foreground">{ban.reason}</td>
                          <td className="p-4">{ban.admin_name || `ID: ${ban.banned_by}`}</td>
                          <td className="p-4 text-muted-foreground">
                            {ban.expires_at ? new Date(ban.expires_at).toLocaleString('ru-RU') : 'Навсегда'}
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleToggleBan(ban.id, true)}
                            >
                              <Icon name="Unlock" size={16} className="mr-2" />
                              Разбанить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mutes">
          <Card>
            <CardHeader>
              <CardTitle>Активные муты</CardTitle>
              <CardDescription>Управление мутами пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              {activeMutes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Нет активных мутов</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-semibold">Пользователь</th>
                        <th className="text-left p-4 font-semibold">Причина</th>
                        <th className="text-left p-4 font-semibold">Замутил</th>
                        <th className="text-left p-4 font-semibold">Истекает</th>
                        <th className="text-left p-4 font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeMutes.map((mute) => (
                        <tr key={mute.id} className="border-b border-border hover:bg-muted/30">
                          <td className="p-4 font-medium">{mute.username || `ID: ${mute.user_id}`}</td>
                          <td className="p-4 text-muted-foreground">{mute.reason}</td>
                          <td className="p-4">{mute.admin_name || `ID: ${mute.muted_by}`}</td>
                          <td className="p-4 text-muted-foreground">
                            {mute.expires_at ? new Date(mute.expires_at).toLocaleString('ru-RU') : 'Навсегда'}
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleToggleMute(mute.id, true)}
                            >
                              <Icon name="Volume2" size={16} className="mr-2" />
                              Размутить
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Логи модерации</CardTitle>
              <CardDescription>История всех действий модераторов</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Нет записей в логах</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/30">
                      <div className="mt-1">{getActionIcon(log.action_type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{log.admin_username || `Admin ID: ${log.admin_id}`}</span>
                          <Badge variant="outline">{log.action_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.target_username ? `Пользователь: ${log.target_username}` : ''}
                          {log.reason && ` • Причина: ${log.reason}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
