import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import UserStatusBadge from './UserStatusBadge';

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

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onStatusUpdate: () => void;
}

export default function UserDetailsDialog({
  open,
  onOpenChange,
  user,
  onStatusUpdate,
}: UserDetailsDialogProps) {
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setNewStatus(user.user_status);
    }
  }, [user]);

  const handleUpdateStatus = async () => {
    if (!user || !newStatus.trim()) return;

    setIsUpdating(true);
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch('https://functions.poehali.dev/5cead9f1-4ea0-437f-836e-c5e9e9781cd6?action=update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken || ''
        },
        body: JSON.stringify({
          user_id: user.id,
          status: newStatus.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: '✅ Статус обновлен!',
        description: `Статус пользователя ${user.nickname} изменен`,
        className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
      });

      onStatusUpdate();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  const statusPresets = [
    { label: 'Новичок', color: 'bg-green-500/20 border-green-500/40 text-green-400' },
    { label: 'Игрок', color: 'bg-white/20 border-white/40 text-white' },
    { label: 'Модератор', color: 'bg-blue-500/20 border-blue-500/40 text-blue-400' },
    { label: 'Администратор', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' },
    { label: 'Главный администратор', color: 'bg-gradient-to-r from-red-600 to-red-500 border-red-500 text-white' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Icon name="UserCircle" size={32} className="text-primary" />
            Информация о пользователе
          </DialogTitle>
          <DialogDescription>
            Подробная информация и управление пользователем
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="User" size={20} />
              Основная информация
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background/50 border border-primary/20">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Никнейм</div>
                <div className="font-bold text-lg">{user.nickname}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="font-mono text-sm">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Discord</div>
                <div className="font-mono text-sm">{user.discord || 'Не указан'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Команда</div>
                <div className="text-sm">{user.team || 'Нет команды'}</div>
              </div>
            </div>
          </div>

          {/* Роль и статус */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="Shield" size={20} />
              Роль и статус
            </h3>
            <div className="p-4 rounded-lg bg-background/50 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Роль в системе</div>
                <Badge className="capitalize">{user.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Организатор турниров</div>
                <Badge className={user.is_organizer ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 'bg-gray-500/20 text-gray-400'}>
                  {user.is_organizer ? '👑 Да' : 'Нет'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Текущий статус</div>
                <UserStatusBadge status={user.user_status} />
              </div>
            </div>
          </div>

          {/* Достижения */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="Award" size={20} />
              Достижения
            </h3>
            <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Очки достижений</div>
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  <Icon name="Star" size={14} className="mr-1" />
                  {user.achievement_points || 0} очков
                </Badge>
              </div>
            </div>
          </div>

          {/* Даты */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="Calendar" size={20} />
              Даты
            </h3>
            <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Дата регистрации</div>
                <div className="text-sm font-mono">
                  {new Date(user.created_at).toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Изменение статуса */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="Edit" size={20} />
              Изменить статус
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="status">Новый статус</Label>
                <Input
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  placeholder="Введите статус"
                  className="mt-2"
                />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Быстрый выбор:</div>
                <div className="flex flex-wrap gap-2">
                  {statusPresets.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setNewStatus(preset.label)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${preset.color} hover:opacity-80 transition-opacity`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleUpdateStatus}
                disabled={!newStatus.trim() || newStatus === user.user_status || isUpdating}
                className="w-full"
              >
                {isUpdating ? 'Обновление...' : 'Сохранить новый статус'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
