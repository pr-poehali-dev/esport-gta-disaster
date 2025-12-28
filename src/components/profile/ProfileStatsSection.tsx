import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import LevelSystem, { getUserXP } from '@/components/LevelSystem';

interface ProfileStatsSectionProps {
  profile: any;
}

export default function ProfileStatsSection({ profile }: ProfileStatsSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <LevelSystem totalXP={getUserXP()} />

      <Card className="p-6 bg-card/50">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Clock" size={24} className="text-primary" />
          <h3 className="text-lg font-bold">Статистика</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Время на сайте:</span>
            <span className="font-bold">{profile.total_time_hours} ч</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Очки достижений:</span>
            <span className="font-bold">{profile.achievement_points || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Дата регистрации:</span>
            <span className="font-bold">{new Date(profile.created_at).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => navigate('/achievements')}
        >
          <Icon name="Trophy" className="mr-2 h-4 w-4" />
          Мои достижения
        </Button>
      </Card>

      <Card className="p-6 bg-card/50">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Users" size={24} className="text-primary" />
          <h3 className="text-lg font-bold">Информация</h3>
        </div>
        <div className="space-y-3">
          {profile.team && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Команда:</span>
              <span className="font-bold">{profile.team}</span>
            </div>
          )}
          {profile.discord && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discord:</span>
              <span className="font-bold">{profile.discord}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-bold text-sm">{profile.email}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
