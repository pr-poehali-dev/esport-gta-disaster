import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import UserStatusBadge from './UserStatusBadge';
import UserDetailsDialog from './UserDetailsDialog';

interface User {
  id: number;
  email: string;
  nickname: string;
  discord?: string;
  team?: string;
  user_status: string;
  role: string;
  is_organizer: boolean;
  achievement_points?: number;
  created_at: string;
}

export default function UserManagementPanel() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch('https://functions.poehali.dev/5cead9f1-4ea0-437f-836e-c5e9e9781cd6?action=users', {
        headers: {
          'X-Session-Token': sessionToken || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Failed to load users');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const handleStatusUpdated = () => {
    loadUsers();
    setShowDetailsDialog(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.user_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const statusOptions = [
    'Новичок',
    'Игрок',
    'Модератор',
    'Администратор',
    'Главный администратор'
  ];

  if (loading) {
    return (
      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Загрузка пользователей...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Icon name="Users" className="text-primary" size={24} />
            Управление пользователями
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по никнейму или email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px] bg-background/50 border-primary/30">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    size="icon"
                    className="border-primary/30 hover:bg-primary/10"
                  >
                    <Icon name="X" size={18} />
                  </Button>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Найдено пользователей: {filteredUsers.length} из {users.length}
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="UserX" size={48} className="mx-auto mb-4 opacity-30" />
                <p className="mb-2">Пользователи не найдены</p>
                <p className="text-sm">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(user)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-lg">{user.nickname}</div>
                    {user.is_organizer && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                        👑 Организатор
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">{user.email}</div>
                  <div className="flex items-center gap-2">
                    <UserStatusBadge status={user.user_status} />
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      <Icon name="Star" size={12} className="inline mr-1" />
                      {user.achievement_points || 0} очков
                    </span>
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(user);
                  }}
                  variant="outline"
                  size="sm"
                  className="border-primary/30"
                >
                  <Icon name="Info" size={16} className="mr-2" />
                  Подробнее
                </Button>
              </div>
            ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <UserDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        user={selectedUser}
        onStatusUpdate={handleStatusUpdated}
      />
    </>
  );
}