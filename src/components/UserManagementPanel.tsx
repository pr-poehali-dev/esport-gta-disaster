import { useState, useEffect, useMemo } from 'react';
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
  const [sortBy, setSortBy] = useState<'date' | 'points' | 'nickname'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.user_status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'points') {
        comparison = (a.achievement_points || 0) - (b.achievement_points || 0);
      } else if (sortBy === 'nickname') {
        comparison = a.nickname.localeCompare(b.nickname);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Никнейм', 'Email', 'Discord', 'Команда', 'Статус', 'Роль', 'Организатор', 'Очки', 'Дата регистрации'];
    
    const rows = filteredUsers.map(user => [
      user.id,
      user.nickname,
      user.email,
      user.discord || '-',
      user.team || '-',
      user.user_status,
      user.role,
      user.is_organizer ? 'Да' : 'Нет',
      user.achievement_points || 0,
      new Date(user.created_at).toLocaleDateString('ru-RU')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: '✅ Экспорт завершен!',
      description: `Экспортировано ${filteredUsers.length} пользователей`,
      className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
    });
  };

  const statusOptions = [
    'Новичок',
    'Игрок',
    'Модератор',
    'Администратор',
    'Главный администратор'
  ];

  const statistics = useMemo(() => {
    const totalUsers = users.length;
    const organizers = users.filter(u => u.is_organizer).length;
    const totalPoints = users.reduce((sum, u) => sum + (u.achievement_points || 0), 0);
    const avgPoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;
    
    const statusCounts = statusOptions.reduce((acc, status) => {
      acc[status] = users.filter(u => u.user_status === status).length;
      return acc;
    }, {} as Record<string, number>);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const newUsers = users.filter(u => new Date(u.created_at) >= last7Days).length;

    return {
      totalUsers,
      organizers,
      avgPoints,
      statusCounts,
      newUsers
    };
  }, [users]);

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
      <Card className="border-primary/30 bg-card/80 backdrop-blur mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Icon name="BarChart" className="text-primary" size={24} />
            Статистика платформы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Users" className="text-primary" size={20} />
                <div className="text-sm text-muted-foreground">Всего пользователей</div>
              </div>
              <div className="text-3xl font-black text-white">{statistics.totalUsers}</div>
              {statistics.newUsers > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  +{statistics.newUsers} за 7 дней
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Crown" className="text-yellow-500" size={20} />
                <div className="text-sm text-muted-foreground">Организаторов</div>
              </div>
              <div className="text-3xl font-black text-white">{statistics.organizers}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {statistics.totalUsers > 0 ? Math.round((statistics.organizers / statistics.totalUsers) * 100) : 0}% от всех
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Star" className="text-secondary" size={20} />
                <div className="text-sm text-muted-foreground">Средние очки</div>
              </div>
              <div className="text-3xl font-black text-white">{statistics.avgPoints}</div>
              <div className="text-xs text-muted-foreground mt-1">
                на игрока
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Trophy" className="text-accent" size={20} />
                <div className="text-sm text-muted-foreground">Игроков</div>
              </div>
              <div className="text-3xl font-black text-white">{statistics.statusCounts['Игрок'] || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">
                активных участников
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-background/50 border border-primary/20">
            <div className="text-sm font-bold mb-3">Распределение по статусам:</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {statusOptions.map(status => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-black text-primary">{statistics.statusCounts[status] || 0}</div>
                  <div className="text-xs text-muted-foreground">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Users" className="text-primary" size={24} />
              Управление пользователями
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="border-primary/30 hover:bg-primary/10"
              disabled={filteredUsers.length === 0}
            >
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
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

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Сортировка:</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSortBy('date')}
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    className={sortBy === 'date' ? 'bg-primary/20 border-primary/40' : 'border-primary/30'}
                  >
                    <Icon name="Calendar" size={14} className="mr-1" />
                    Дата
                  </Button>
                  <Button
                    onClick={() => setSortBy('points')}
                    variant={sortBy === 'points' ? 'default' : 'outline'}
                    size="sm"
                    className={sortBy === 'points' ? 'bg-primary/20 border-primary/40' : 'border-primary/30'}
                  >
                    <Icon name="Star" size={14} className="mr-1" />
                    Очки
                  </Button>
                  <Button
                    onClick={() => setSortBy('nickname')}
                    variant={sortBy === 'nickname' ? 'default' : 'outline'}
                    size="sm"
                    className={sortBy === 'nickname' ? 'bg-primary/20 border-primary/40' : 'border-primary/30'}
                  >
                    <Icon name="User" size={14} className="mr-1" />
                    Никнейм
                  </Button>
                  <Button
                    onClick={toggleSortOrder}
                    variant="outline"
                    size="icon"
                    className="border-primary/30 h-8 w-8"
                  >
                    <Icon name={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} size={14} />
                  </Button>
                </div>
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