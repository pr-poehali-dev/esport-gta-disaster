import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/lib/auth';
import { playClickSound, playHoverSound } from '@/utils/sounds';
import AchievementBadge from '@/components/AchievementBadge';

interface ProfileAchievementsCardProps {
  user: User;
  team: any;
  registrations: any[];
  onNavigateToAchievements: () => void;
}

export default function ProfileAchievementsCard({
  user,
  team,
  registrations,
  onNavigateToAchievements,
}: ProfileAchievementsCardProps) {
  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Award" className="text-primary" size={24} />
            Мои достижения
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-primary/10 text-primary border-primary/30">
              <Icon name="Star" size={14} className="mr-1" />
              {(user as any).achievement_points || 0} очков
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AchievementBadge
            icon="👋"
            name="Добро пожаловать!"
            description="Зарегистрировался на платформе"
            rarity="common"
            unlocked={user.user_status !== undefined}
            points={10}
            unlockedAt={user.created_at}
            size="sm"
          />
          <AchievementBadge
            icon="🎮"
            name="Первый турнир"
            description="Зарегистрировался на первый турнир"
            rarity="common"
            unlocked={user.user_status === 'Игрок' || registrations.length > 0}
            points={20}
            size="sm"
          />
          <AchievementBadge
            icon="⚔️"
            name="Капитан команды"
            description="Создал свою команду"
            rarity="rare"
            unlocked={!!team}
            points={30}
            size="sm"
          />
          <AchievementBadge
            icon="🔥"
            name="Первая кровь"
            description="Одержи свою первую победу в турнире"
            rarity="rare"
            unlocked={false}
            points={50}
            size="sm"
          />
          <AchievementBadge
            icon="👑"
            name="Чемпион"
            description="Выиграй турнир"
            rarity="epic"
            unlocked={false}
            points={100}
            size="sm"
          />
          <AchievementBadge
            icon="⚡"
            name="Легенда"
            description="Одержи 10 побед подряд"
            rarity="epic"
            unlocked={false}
            points={150}
            size="sm"
          />
        </div>
        <div className="mt-6 pt-6 border-t border-primary/20 text-center">
          <Button 
            onClick={() => {
              playClickSound();
              onNavigateToAchievements();
            }}
            onMouseEnter={playHoverSound}
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
          >
            <Icon name="Trophy" size={18} className="mr-2" />
            Смотреть все достижения
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
