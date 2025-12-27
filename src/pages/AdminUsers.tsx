import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  nickname: string;
  email: string;
  role: string;
  status: string;
  avatar_url?: string;
  signature?: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
        return false;
      }
      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'admin' && userData.role !== 'founder') {
          navigate('/');
          return false;
        }
        return true;
      } catch (e) {
        navigate('/login');
        return false;
      }
    };

    if (!checkAuth()) return;
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': localStorage.getItem('session_token') || ''
        },
        body: JSON.stringify({ action: 'admin_get_users' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: number, updates: Partial<User>) => {
    try {
      const response = await fetch('https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': localStorage.getItem('session_token') || ''
        },
        body: JSON.stringify({
          action: 'admin_update_user',
          user_id: userId,
          ...updates
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Пользователь обновлен'
        });
        setEditingUser(null);
        loadUsers();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить пользователя',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      admin: { variant: 'destructive', label: 'Администратор' },
      founder: { variant: 'default', label: 'Основатель' },
      organizer: { variant: 'secondary', label: 'Организатор' },
      user: { variant: 'outline', label: 'Пользователь' }
    };
    const config = variants[role] || variants.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      active: { variant: 'default', label: 'Активен' },
      banned: { variant: 'destructive', label: 'Заблокирован' },
      pending: { variant: 'secondary', label: 'Ожидает' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Управление пользователями</h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
            Назад в админку
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Поиск пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Поиск по нику или email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  {editingUser?.id === user.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Роль</label>
                          <Select
                            value={editingUser.role}
                            onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Пользователь</SelectItem>
                              <SelectItem value="organizer">Организатор</SelectItem>
                              <SelectItem value="admin">Администратор</SelectItem>
                              <SelectItem value="founder">Основатель</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Статус</label>
                          <Select
                            value={editingUser.status}
                            onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Активен</SelectItem>
                              <SelectItem value="banned">Заблокирован</SelectItem>
                              <SelectItem value="pending">Ожидает</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updateUser(user.id, { role: editingUser.role, status: editingUser.status })}>
                          Сохранить
                        </Button>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.nickname} className="w-12 h-12 rounded-full" />
                          ) : (
                            <Icon name="User" className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.nickname}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.signature && (
                            <div className="text-xs text-muted-foreground mt-1">{user.signature}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user.status)}
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}