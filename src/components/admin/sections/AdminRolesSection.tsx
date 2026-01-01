import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function AdminRolesSection() {
  const [staff, setStaff] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isFounder = user.role === 'founder';

  useEffect(() => {
    loadStaff();
    loadAllUsers();
    loadHistory();
  }, []);

  const loadStaff = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_staff' }),
      });

      const data = await response.json();
      if (data.staff) {
        setStaff(data.staff);
      }
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  const loadAllUsers = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_all_users' }),
      });

      const data = await response.json();
      if (data.users) {
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_role_history', limit: 20 }),
      });

      const data = await response.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: 'Ошибка',
        description: 'Выберите пользователя и роль',
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
          action: 'assign_role',
          user_id: selectedUserId,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadStaff();
        loadHistory();
        setSelectedUserId('');
        setSelectedRole('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось назначить роль',
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

  const handleRevokeRole = async (userId: number) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'revoke_role',
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadStaff();
        loadHistory();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось снять роль',
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

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      founder: 'bg-purple-600 text-white',
      organizer: 'bg-blue-600 text-white',
      admin: 'bg-red-600 text-white',
      referee: 'bg-cyan-600 text-white',
      user: 'bg-gray-600 text-white',
    };

    const roleNames: Record<string, string> = {
      founder: 'Основатель',
      organizer: 'Организатор',
      admin: 'Администратор',
      referee: 'Судья',
      user: 'Пользователь',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[role] || 'bg-gray-600 text-white'}`}>
        {roleNames[role] || role}
      </span>
    );
  };

  if (!isFounder) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление ролями</CardTitle>
          <CardDescription>Только основатель может управлять ролями</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">У вас нет прав для просмотра этого раздела.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Crown" size={24} />
            Управление ролями
          </CardTitle>
          <CardDescription>
            Назначайте роли администраторов и модераторов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Пользователь</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите пользователя" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.nickname} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Роль</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="organizer">Организатор</SelectItem>
                  <SelectItem value="referee">Судья</SelectItem>
                  <SelectItem value="user">Пользователь</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleAssignRole} disabled={loading}>
            <Icon name="UserPlus" size={18} className="mr-2" />
            Назначить роль
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Текущие администраторы</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Последняя активность</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-2">
                    {member.avatar_url && (
                      <img
                        src={member.avatar_url}
                        alt={member.nickname}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    {member.nickname}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>
                    {member.last_activity_at
                      ? new Date(member.last_activity_at).toLocaleDateString('ru-RU')
                      : 'Никогда'}
                  </TableCell>
                  <TableCell>
                    {member.role !== 'founder' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokeRole(member.id)}
                        disabled={loading}
                      >
                        <Icon name="UserMinus" size={16} className="mr-1" />
                        Снять роль
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Последние действия</CardTitle>
          <CardDescription className="text-xs">История изменения ролей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {history.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 border-b">
                <div className="flex-1">
                  <span className="font-medium">{item.admin_name}</span>
                  <span className="text-muted-foreground"> изменил роль </span>
                  <span className="font-medium">{item.target_name}</span>
                  <span className="text-muted-foreground"> с </span>
                  <span className="text-xs">{getRoleBadge(item.old_role)}</span>
                  <span className="text-muted-foreground"> на </span>
                  <span className="text-xs">{getRoleBadge(item.new_role)}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}