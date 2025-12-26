import { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { playAchievementSound } from '@/utils/sounds';

const loadConfetti = async () => {
  const module = await import('canvas-confetti');
  return module.default;
};

interface AchievementUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    icon: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
  } | null;
}

const rarityStyles = {
  common: {
    border: 'border-gray-500/50',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    gradient: 'from-gray-500/20 to-gray-600/20'
  },
  rare: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-600/20'
  },
  epic: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/20'
  },
  legendary: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-yellow-600/20'
  }
};

const rarityLabels = {
  common: 'Обычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное'
};

const triggerConfetti = async (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
  const confetti = await loadConfetti();
  
  const colors = {
    common: ['#9CA3AF', '#6B7280'],
    rare: ['#3B82F6', '#2563EB', '#60A5FA'],
    epic: ['#A855F7', '#9333EA', '#C084FC'],
    legendary: ['#EAB308', '#F59E0B', '#FCD34D']
  };

  const count = {
    common: 50,
    rare: 100,
    epic: 150,
    legendary: 200
  };

  const particleCount = count[rarity];
  const confettiColors = colors[rarity];

  confetti({
    particleCount: particleCount / 2,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.6 },
    colors: confettiColors
  });

  confetti({
    particleCount: particleCount / 2,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.6 },
    colors: confettiColors
  });

  if (rarity === 'legendary') {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 360,
        origin: { x: 0.5, y: 0.5 },
        colors: confettiColors,
        startVelocity: 45,
        ticks: 200,
        gravity: 0.8
      });
    }, 300);
  }
};

const AchievementUnlockModal = ({ isOpen, onClose, achievement }: AchievementUnlockModalProps) => {
  useEffect(() => {
    if (isOpen && achievement) {
      playAchievementSound(achievement.rarity);
      
      setTimeout(() => {
        triggerConfetti(achievement.rarity);
      }, 300);
    }
  }, [isOpen, achievement]);

  if (!achievement) return null;

  const styles = rarityStyles[achievement.rarity];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        'max-w-md p-0 overflow-hidden border-2',
        styles.border,
        'bg-gradient-to-br from-background to-background/80 backdrop-blur-xl'
      )}>
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-10', styles.gradient)}></div>
        
        <div className="relative z-10 p-8">
          <div className="text-center mb-6">
            <Badge className={cn('mb-4', styles.bg, styles.text, styles.border)}>
              <Icon name="Sparkles" size={14} className="mr-1" />
              Достижение получено!
            </Badge>
            
            <div className={cn(
              'text-8xl mb-6 inline-block',
              'animate-bounce-in'
            )}>
              {achievement.icon}
            </div>
            
            <h2 className="text-3xl font-black mb-2 text-white animate-fade-in-up">
              {achievement.name}
            </h2>
            
            <p className="text-muted-foreground mb-4 animate-fade-in-up animation-delay-100">
              {achievement.description}
            </p>
            
            <div className="flex items-center justify-center gap-3 animate-fade-in-up animation-delay-200">
              <Badge variant="outline" className={cn('text-sm', styles.text, styles.border)}>
                {rarityLabels[achievement.rarity]}
              </Badge>
              <Badge variant="outline" className="text-sm border-primary/30">
                <Icon name="Star" size={14} className="mr-1" />
                +{achievement.points} очков
              </Badge>
            </div>
          </div>
          
          <div className={cn(
            'w-full h-1 rounded-full overflow-hidden mb-6',
            styles.bg
          )}>
            <div 
              className={cn('h-full animate-progress-bar', styles.bg)}
              style={{
                background: `linear-gradient(90deg, transparent, currentColor)`,
                animation: 'progress-bar 1s ease-out forwards'
              }}
            ></div>
          </div>
          
          <button
            onClick={onClose}
            className={cn(
              'w-full py-3 px-6 rounded font-bold',
              'bg-gradient-to-r text-white',
              styles.gradient,
              'hover:opacity-90 transition-opacity',
              'border-2',
              styles.border
            )}
          >
            Продолжить
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementUnlockModal;