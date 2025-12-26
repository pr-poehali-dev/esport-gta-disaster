import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  nickname: string;
  user_status: string;
  role: string;
  is_organizer: boolean;
  created_at: string;
}

export default function UserManagementPanel() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  const handleEditStatus = (user: User) => {
    setSelectedUser(user);
    setNewStatus(user.user_status);
    setShowEditDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !newStatus.trim()) return;

    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch('https://functions.poehali.dev/5cead9f1-4ea0-437f-836e-c5e9e9781cd6?action=update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken || ''
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          status: newStatus.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: '✅ Статус обновлен!',
        description: `Статус пользователя ${selectedUser.nickname} изменен`,
        className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
      });

      setShowEditDialog(false);
      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

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
          <div className="space-y-3">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-primary/20"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-bold">{user.nickname}</div>
                    {user.is_organizer && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                        👑 Организатор
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">Статус: </span>
                    <span className="font-semibold text-primary">{user.user_status}</span>
                  </div>
                </div>
                <Button
                  onClick={() => handleEditStatus(user)}
                  variant="outline"
                  size="sm"
                  className="border-primary/30"
                >
                  <Icon name="Edit" size={16} className="mr-2" />
                  Изменить статус
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить статус пользователя</DialogTitle>
            <DialogDescription>
              Изменение статуса для {selectedUser?.nickname}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Новый статус</Label>
              <Input
                id="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="Введите статус"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Примеры статусов:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setNewStatus('Новичок')}
                    className="px-2 py-1 rounded bg-background/50 hover:bg-primary/10 border border-primary/20 text-xs"
                  >
                    Новичок
                  </button>
                  <button
                    onClick={() => setNewStatus('Игрок')}
                    className="px-2 py-1 rounded bg-background/50 hover:bg-primary/10 border border-primary/20 text-xs"
                  >
                    Игрок
                  </button>
                  <button
                    onClick={() => setNewStatus('Проверенный игрок')}
                    className="px-2 py-1 rounded bg-background/50 hover:bg-primary/10 border border-primary/20 text-xs"
                  >
                    Проверенный игрок
                  </button>
                  <button
                    onClick={() => setNewStatus('Ветеран')}
                    className="px-2 py-1 rounded bg-background/50 hover:bg-primary/10 border border-primary/20 text-xs"
                  >
                    Ветеран
                  </button>
                  <button
                    onClick={() => setNewStatus('Модератор')}
                    className="px-2 py-1 rounded bg-background/50 hover:bg-primary/10 border border-primary/20 text-xs"
                  >
                    Модератор
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus.trim()}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
