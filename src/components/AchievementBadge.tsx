import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  points: number;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const rarityStyles = {
  common: {
    border: 'border-gray-500/50',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/20'
  },
  rare: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/30'
  },
  epic: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/30'
  },
  legendary: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/40'
  }
};

const rarityLabels = {
  common: 'Обычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное'
};

const AchievementBadge = ({
  icon,
  name,
  description,
  rarity,
  unlocked,
  progress = 0,
  maxProgress = 100,
  points,
  unlockedAt,
  size = 'md'
}: AchievementBadgeProps) => {
  const styles = rarityStyles[rarity];
  const progressPercent = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizes = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        styles.border,
        styles.bg,
        sizeClasses[size],
        unlocked
          ? `hover:scale-105 hover:shadow-lg ${styles.glow} cursor-pointer`
          : 'opacity-50 grayscale cursor-not-allowed'
      )}
    >
      {unlocked && (
        <div className="absolute top-2 right-2">
          <Badge className={cn('text-xs', styles.bg, styles.text, styles.border)}>
            <Icon name="Check" size={12} className="mr-1" />
            Получено
          </Badge>
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'mb-3 transition-transform',
            iconSizes[size],
            unlocked ? 'animate-bounce-subtle' : 'opacity-30'
          )}
        >
          {icon}
        </div>

        <h4 className={cn('font-bold mb-1', unlocked ? 'text-white' : 'text-muted-foreground')}>
          {name}
        </h4>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={cn('text-xs', styles.text, styles.border)}>
            {rarityLabels[rarity]}
          </Badge>
          <Badge variant="outline" className="text-xs border-primary/30">
            <Icon name="Star" size={10} className="mr-1" />
            {points}
          </Badge>
        </div>

        {!unlocked && maxProgress > 0 && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Прогресс</span>
              <span>
                {progress}/{maxProgress}
              </span>
            </div>
            <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', styles.bg, styles.text)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {unlocked && unlockedAt && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Icon name="Calendar" size={10} />
            <span>{new Date(unlockedAt).toLocaleDateString('ru-RU')}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AchievementBadge;
