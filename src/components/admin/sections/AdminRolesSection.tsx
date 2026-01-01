import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleStatsCards } from '@/components/admin/roles/RoleStatsCards';
import { RoleAssignmentForm } from '@/components/admin/roles/RoleAssignmentForm';
import { StaffTable } from '@/components/admin/roles/StaffTable';
import { RoleHistoryList } from '@/components/admin/roles/RoleHistoryList';

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

  const roleStats = {
    founder: staff.filter(s => s.role === 'founder').length,
    admin: staff.filter(s => s.role === 'admin').length,
    organizer: staff.filter(s => s.role === 'organizer').length,
    referee: staff.filter(s => s.role === 'referee').length,
    manager: staff.filter(s => s.role === 'manager').length,
  };

  return (
    <div className="space-y-6">
      <RoleStatsCards roleStats={roleStats} />

      <RoleAssignmentForm
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        allUsers={allUsers}
        loading={loading}
        handleAssignRole={handleAssignRole}
      />

      <StaffTable
        staff={staff}
        loading={loading}
        handleRevokeRole={handleRevokeRole}
        getRoleBadge={getRoleBadge}
      />

      <RoleHistoryList
        history={history}
        getRoleBadge={getRoleBadge}
      />
    </div>
  );
}
