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

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      if (!user.id) {
        console.error('User ID not found in localStorage');
        return null;
      }
      return user;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      return null;
    }
  };

  const user = getUserFromStorage();
  const isFounder = user?.role === 'founder';

  useEffect(() => {
    loadStaff();
    loadAllUsers();
    loadHistory();
  }, []);

  const loadStaff = async () => {
    if (!user || !user.id) return;
    
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
    if (!user || !user.id) return;
    
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
    if (!user || !user.id) return;
    
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
    if (!user || !user.id) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка авторизации. Перезайдите в аккаунт',
        variant: 'destructive',
      });
      return;
    }

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
    if (!user || !user.id) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка авторизации. Перезайдите в аккаунт',
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
      manager: 'bg-green-600 text-white',
      user: 'bg-gray-600 text-white',
    };

    const roleNames: Record<string, string> = {
      founder: 'Основатель',
      organizer: 'Организатор',
      admin: 'Администратор',
      referee: 'Судья',
      manager: 'Руководитель',
      user: 'Пользователь',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[role] || 'bg-gray-600 text-white'}`}>
        {roleNames[role] || role}
      </span>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ошибка авторизации</CardTitle>
          <CardDescription>Не удалось загрузить данные пользователя</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Пожалуйста, перезайдите в аккаунт</p>
        </CardContent>
      </Card>
    );
  }

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

  // Подсчёт администраторов по ролям
  const roleStats = {
    founder: staff.filter(s => s.role === 'founder').length,
    admin: staff.filter(s => s.role === 'admin').length,
    organizer: staff.filter(s => s.role === 'organizer').length,
    referee: staff.filter(s => s.role === 'referee').length,
    manager: staff.filter(s => s.role === 'manager').length,
  };

  return (
    <div className="space-y-6">
      {/* Статистика ролей */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 hover:shadow-lg transition-all border-purple-600/30 bg-purple-600/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <Icon name="Crown" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleStats.founder}</p>
              <p className="text-xs text-muted-foreground">Основатель</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all border-red-600/30 bg-red-600/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleStats.admin}</p>
              <p className="text-xs text-muted-foreground">Администраторы</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all border-blue-600/30 bg-blue-600/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Icon name="Briefcase" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleStats.organizer}</p>
              <p className="text-xs text-muted-foreground">Организаторы</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all border-cyan-600/30 bg-cyan-600/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center">
              <Icon name="Gavel" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleStats.referee}</p>
              <p className="text-xs text-muted-foreground">Судьи</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-all border-green-600/30 bg-green-600/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <Icon name="UserCog" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roleStats.manager}</p>
              <p className="text-xs text-muted-foreground">Руководители</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={24} />
            Управление ролями
          </CardTitle>
          <CardDescription>
            Назначайте роли администраторов, организаторов и судей
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
                  <SelectItem value="manager">Руководитель</SelectItem>
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
          <CardTitle className="flex items-center justify-between">
            <span>Текущие администраторы</span>
            <span className="text-sm font-normal text-muted-foreground">
              Всего: {staff.length}
            </span>
          </CardTitle>
          <CardDescription>
            Список всех пользователей с административными правами
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="UserX" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Нет администраторов</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Дата назначения</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id} className="hover:bg-muted/20">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.avatar_url && (
                            <img
                              src={member.avatar_url}
                              alt={member.nickname}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          {member.nickname}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== 'founder' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleRevokeRole(member.id)}
                            disabled={loading}
                          >
                            <Icon name="UserMinus" size={16} className="mr-1" />
                            Снять роль
                          </Button>
                        )}
                        {member.role === 'founder' && (
                          <span className="text-xs text-muted-foreground italic">
                            Нельзя изменить
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={24} />
            Последние действия
          </CardTitle>
          <CardDescription>История изменения ролей и административных действий</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="FileText" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Нет записей</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-4 border-l-2 border-primary/30 hover:border-primary bg-card hover:bg-muted/20 transition-all"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon name="UserCog" size={16} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{item.admin_name}</span>
                      {item.admin_role && (
                        <span className="text-xs">{getRoleBadge(item.admin_role)}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.old_role && item.new_role ? (
                        <>
                          изменил роль <span className="font-medium text-foreground">{item.target_name}</span> с{' '}
                          <span className="inline-block mx-1">{getRoleBadge(item.old_role)}</span> на{' '}
                          <span className="inline-block mx-1">{getRoleBadge(item.new_role)}</span>
                        </>
                      ) : (
                        <span>{item.action || 'Выполнил действие'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon name="Clock" size={12} />
                      {new Date(item.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}