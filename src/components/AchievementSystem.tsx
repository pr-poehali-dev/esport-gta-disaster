import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: number;
}

interface AchievementNotification extends Achievement {
  show: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_registration',
    title: 'Добро пожаловать!',
    description: 'Зарегистрировались на сайте',
    icon: 'UserPlus',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'email_verified',
    title: 'Подтвержденный игрок',
    description: 'Подтвердили email адрес',
    icon: 'Mail',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'first_post',
    title: 'Первое сообщение',
    description: 'Оставили первый пост на форуме',
    icon: 'MessageSquare',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'first_topic',
    title: 'Создатель темы',
    description: 'Создали первую тему на форуме',
    icon: 'FileText',
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'tournament_participant',
    title: 'Участник турнира',
    description: 'Приняли участие в турнире',
    icon: 'Trophy',
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'tournament_winner',
    title: 'Победитель',
    description: 'Победили в турнире',
    icon: 'Crown',
    rarity: 'legendary',
    unlocked: false
  },
  {
    id: 'active_user',
    title: 'Активный пользователь',
    description: 'Провели на сайте более 10 часов',
    icon: 'Clock',
    rarity: 'epic',
    unlocked: false
  },
  {
    id: 'team_member',
    title: 'Командный игрок',
    description: 'Присоединились к команде',
    icon: 'Users',
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'level_10',
    title: 'Продвинутый',
    description: 'Достигли 10 уровня',
    icon: 'Zap',
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'level_25',
    title: 'Опытный боец',
    description: 'Достигли 25 уровня',
    icon: 'Flame',
    rarity: 'epic',
    unlocked: false
  },
  {
    id: 'level_50',
    title: 'Эксперт',
    description: 'Достигли 50 уровня',
    icon: 'Award',
    rarity: 'epic',
    unlocked: false
  },
  {
    id: 'level_100',
    title: 'Легенда',
    description: 'Достигли 100 уровня',
    icon: 'Star',
    rarity: 'legendary',
    unlocked: false
  },
  {
    id: 'profile_complete',
    title: 'Заполненный профиль',
    description: 'Заполнили все поля профиля',
    icon: 'User',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'social_butterfly',
    title: 'Социальная бабочка',
    description: 'Оставили 50 сообщений на форуме',
    icon: 'MessageCircle',
    rarity: 'rare',
    unlocked: false
  },
  {
    id: 'discussion_starter',
    title: 'Затейник',
    description: 'Создали 10 тем на форуме',
    icon: 'Sparkles',
    rarity: 'epic',
    unlocked: false
  }
];

const STORAGE_KEY = 'user_achievements';

class AchievementManager {
  private listeners: ((achievements: Achievement[]) => void)[] = [];
  private notificationListeners: ((notification: AchievementNotification | null) => void)[] = [];
  private achievements: Achievement[] = [];
  private currentNotification: AchievementNotification | null = null;

  constructor() {
    this.loadAchievements();
  }

  private loadAchievements() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.achievements = JSON.parse(saved);
      } catch {
        this.achievements = [...ACHIEVEMENTS];
      }
    } else {
      this.achievements = [...ACHIEVEMENTS];
    }
  }

  private saveAchievements() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.achievements));
  }

  subscribe(listener: (achievements: Achievement[]) => void) {
    this.listeners.push(listener);
    listener(this.achievements);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToNotifications(listener: (notification: AchievementNotification | null) => void) {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.achievements]));
  }

  private notifyAchievement(achievement: AchievementNotification | null) {
    this.currentNotification = achievement;
    this.notificationListeners.forEach(listener => listener(achievement));
  }

  private async playAchievementSound(rarity: Achievement['rarity']) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const frequencies = {
        common: [523, 659, 784],
        rare: [523, 659, 784, 1047],
        epic: [523, 659, 784, 1047, 1319],
        legendary: [523, 659, 784, 1047, 1319, 1568]
      };

      const notes = frequencies[rarity];
      
      for (let i = 0; i < notes.length; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(notes[i], audioContext.currentTime + i * 0.1);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.15);

        oscillator.start(audioContext.currentTime + i * 0.1);
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.15);
      }
    } catch (e) {
      console.log('Sound playback not available');
    }
  }

  unlock(achievementId: string) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    
    if (!achievement || achievement.unlocked) {
      return false;
    }

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    
    this.saveAchievements();
    this.notify();
    
    this.playAchievementSound(achievement.rarity);
    
    this.notifyAchievement({ ...achievement, show: true });
    
    setTimeout(() => {
      this.notifyAchievement(null);
    }, 6000);

    return true;
  }

  getAchievements() {
    return [...this.achievements];
  }

  getProgress() {
    const total = this.achievements.length;
    const unlocked = this.achievements.filter(a => a.unlocked).length;
    return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
  }
}

export const achievementManager = new AchievementManager();

export function unlockAchievement(achievementId: string) {
  return achievementManager.unlock(achievementId);
}

function AchievementNotificationPopup() {
  const [notification, setNotification] = useState<AchievementNotification | null>(null);

  useEffect(() => {
    return achievementManager.subscribeToNotifications(setNotification);
  }, []);

  if (!notification || !notification.show) return null;

  const getRarityColors = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-500/20 to-gray-700/20 border-gray-500/30';
      case 'rare': return 'from-blue-500/20 to-blue-700/20 border-blue-500/30';
      case 'epic': return 'from-purple-500/20 to-purple-700/20 border-purple-500/30';
      case 'legendary': return 'from-yellow-500/20 to-yellow-700/20 border-yellow-500/30';
    }
  };

  const getRarityText = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'Обычное';
      case 'rare': return 'Редкое';
      case 'epic': return 'Эпическое';
      case 'legendary': return 'Легендарное';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto animate-in zoom-in-95 duration-500">
        <Card className={`p-8 bg-gradient-to-br ${getRarityColors(notification.rarity)} border-2 backdrop-blur-xl shadow-2xl max-w-md relative overflow-hidden`}>
          <button
            onClick={() => achievementManager.subscribeToNotifications(() => {})}
            className="absolute top-4 right-4 hover:opacity-70 transition-opacity z-10"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>

          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white to-transparent" 
                 style={{ animationDuration: '2s' }} />
          </div>

          <div className="relative">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background/50 mb-4 animate-bounce">
                <Icon name={notification.icon as any} className="h-10 w-10 text-primary" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {getRarityText(notification.rarity)} достижение
              </div>
              <h2 className="text-3xl font-black mb-2 text-gradient">
                {notification.title}
              </h2>
              <p className="text-muted-foreground">
                {notification.description}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border/50">
              <Icon name="Star" className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Достижение разблокировано!</span>
              <Icon name="Star" className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  );
}

export default function AchievementSystem() {
  return <AchievementNotificationPopup />;
}

export function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    return achievementManager.subscribe(setAchievements);
  }, []);

  const progress = achievementManager.getProgress();

  const getRarityColors = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/30';
      case 'rare': return 'border-blue-500/30';
      case 'epic': return 'border-purple-500/30';
      case 'legendary': return 'border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Прогресс достижений</h3>
          <span className="text-2xl font-black text-primary">{progress.percentage}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Разблокировано: {progress.unlocked} из {progress.total}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id}
            className={`p-6 border-2 ${getRarityColors(achievement.rarity)} transition-all ${
              achievement.unlocked ? 'opacity-100' : 'opacity-50 grayscale'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                achievement.unlocked ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <Icon name={achievement.icon as any} className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold mb-1 flex items-center gap-2">
                  {achievement.title}
                  {achievement.unlocked && <Icon name="Check" className="h-4 w-4 text-green-500" />}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {achievement.description}
                </p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-muted-foreground">
                    Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}