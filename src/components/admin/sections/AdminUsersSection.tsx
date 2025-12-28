import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface User {
  id: number;
  nickname: string;
  email: string;
  role: string;
  auto_status: string;
  is_banned: boolean;
  is_muted: boolean;
  created_at: string;
  last_active: string | null;
}

export function AdminUsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showMuteDialog, setShowMuteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('7');
  const [isPermanent, setIsPermanent] = useState(false);
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
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({ action: 'get_all_users' }),
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину бана',
        variant: 'destructive',
      });
      return;
    }

    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'verify_and_execute',
          code: '000000',
        }),
      });

      const codeResponse = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'send_verification_code',
          action_type: 'ban',
          action_data: {
            user_id: selectedUser.id,
            reason: banReason,
            duration_days: parseInt(banDuration),
            is_permanent: isPermanent,
          },
        }),
      });

      if (codeResponse.ok) {
        toast({
          title: 'Код отправлен',
          description: 'Проверьте email для подтверждения',
        });
        setShowBanDialog(false);
        setBanReason('');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить действие',
        variant: 'destructive',
      });
    }
  };

  const handleMuteUser = async () => {
    if (!selectedUser || !banReason) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину мута',
        variant: 'destructive',
      });
      return;
    }

    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'send_verification_code',
          action_type: 'mute',
          action_data: {
            user_id: selectedUser.id,
            reason: banReason,
            duration_days: parseInt(banDuration),
            is_permanent: isPermanent,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: 'Код отправлен',
          description: 'Проверьте email для подтверждения',
        });
        setShowMuteDialog(false);
        setBanReason('');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить действие',
        variant: 'destructive',
      });
    }
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      user: 'Пользователь',
      moderator: 'Модератор',
      admin: 'Администратор',
      founder: 'Основатель',
      organizer: 'Организатор',
    };
    return roles[role] || role;
  };

  const getStatusName = (user: User) => {
    if (user.is_banned) return { label: 'Забанен', color: 'bg-red-500/20 text-red-500' };
    if (user.is_muted) return { label: 'Замучен', color: 'bg-orange-500/20 text-orange-500' };
    return { label: user.auto_status || 'Активен', color: 'bg-green-500/20 text-green-500' };
  };

  const filteredUsers = users.filter(
    (user) =>
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Пользователями</h1>
        <Button onClick={loadUsers} variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Поиск по username или email..."
          className="flex-1"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline">
          <Icon name="Search" size={20} />
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Пользователи не найдены</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-semibold">ID</th>
                  <th className="text-left p-4 font-semibold">Username</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Роль</th>
                  <th className="text-left p-4 font-semibold">Статус</th>
                  <th className="text-left p-4 font-semibold">Дата регистрации</th>
                  <th className="text-left p-4 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const status = getStatusName(user);
                  return (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                      <td className="p-4 text-muted-foreground">#{user.id}</td>
                      <td className="p-4 font-medium">{user.nickname}</td>
                      <td className="p-4 text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-sm ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBanDialog(true);
                            }}
                            disabled={user.is_banned}
                          >
                            <Icon name="Ban" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowMuteDialog(true);
                            }}
                            disabled={user.is_muted}
                          >
                            <Icon name="MessageSquareOff" size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Забанить пользователя {selectedUser?.nickname}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Причина бана</Label>
              <Input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Нарушение правил..."
              />
            </div>
            <div>
              <Label>Длительность</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 день</SelectItem>
                  <SelectItem value="3">3 дня</SelectItem>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="14">14 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                  <SelectItem value="permanent">Навсегда</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleBanUser} className="w-full">
              Забанить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMuteDialog} onOpenChange={setShowMuteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Замутить пользователя {selectedUser?.nickname}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Причина мута</Label>
              <Input
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Оскорбления..."
              />
            </div>
            <div>
              <Label>Длительность</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 день</SelectItem>
                  <SelectItem value="3">3 дня</SelectItem>
                  <SelectItem value="7">7 дней</SelectItem>
                  <SelectItem value="14">14 дней</SelectItem>
                  <SelectItem value="30">30 дней</SelectItem>
                  <SelectItem value="permanent">Навсегда</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleMuteUser} className="w-full">
              Замутить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}