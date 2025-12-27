import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/auth';
import { playHoverSound, playClickSound } from '@/utils/sounds';
import OrganizerBadge from '@/components/OrganizerBadge';
import UserStatusBadge from '@/components/UserStatusBadge';

interface ProfileInfoCardProps {
  user: User;
  isEditing: boolean;
  formData: {
    nickname: string;
    discord: string;
    team: string;
  };
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onFormChange: (field: string, value: string) => void;
}

export default function ProfileInfoCard({
  user,
  isEditing,
  formData,
  loading,
  onEdit,
  onCancel,
  onUpdate,
  onFormChange,
}: ProfileInfoCardProps) {
  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${user.is_organizer ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-gradient-to-br from-primary to-secondary'} rounded-full clip-corner flex items-center justify-center text-2xl`}>
              {user.is_organizer ? '👑' : user.nickname[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-black">{user.nickname}</div>
                {user.is_organizer && <OrganizerBadge size="sm" variant="compact" />}
                <UserStatusBadge status={(user as any).user_status || 'Новичок'} />
              </div>
              <div className="text-sm text-muted-foreground font-normal">{user.email}</div>
            </div>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => {
                playClickSound();
                onEdit();
              }}
              onMouseEnter={playHoverSound}
              variant="outline"
              className="border-primary/30 hover:bg-primary/10"
            >
              <Icon name="Edit" size={18} className="mr-2" />
              Редактировать
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Discord</div>
                <div className="font-bold">{user.discord || 'Не указан'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Команда</div>
                <div className="font-bold">{user.team || 'Нет команды'}</div>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Роль</div>
              <div className="font-bold capitalize">{user.role}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Дата регистрации</div>
              <div className="font-bold">{new Date(user.created_at).toLocaleDateString('ru-RU')}</div>
            </div>
          </div>
        ) : (
          <form onSubmit={onUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-2 block">Никнейм</label>
              <Input
                value={formData.nickname}
                onChange={(e) => onFormChange('nickname', e.target.value)}
                required
                className="bg-background/50 border-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">Discord</label>
              <Input
                value={formData.discord}
                onChange={(e) => onFormChange('discord', e.target.value)}
                placeholder="username#1234"
                className="bg-background/50 border-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">Команда</label>
              <Input
                value={formData.team}
                onChange={(e) => onFormChange('team', e.target.value)}
                placeholder="Название команды"
                className="bg-background/50 border-primary/30 focus:border-primary"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                type="submit"
                disabled={loading}
                onMouseEnter={playHoverSound}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
              >
                <Icon name="Save" className="mr-2" size={18} />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  playClickSound();
                  onCancel();
                }}
                onMouseEnter={playHoverSound}
                variant="outline"
                className="border-primary/30 hover:bg-destructive/10"
              >
                Отмена
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
