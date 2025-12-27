import { useState, useCallback } from 'react';
import { Achievement } from '@/components/AchievementPopup';

const ACHIEVEMENTS_KEY = 'user_achievements';

export const ACHIEVEMENTS_CONFIG: Record<string, Omit<Achievement, 'id' | 'timestamp'>> = {
  first_registration: {
    title: 'Добро пожаловать!',
    description: 'Вы успешно зарегистрировались на платформе',
    icon: 'UserPlus',
    rarity: 'common',
  },
  first_login: {
    title: 'Первый вход',
    description: 'Вы впервые вошли в свой аккаунт',
    icon: 'LogIn',
    rarity: 'common',
  },
  forum_first_post: {
    title: 'Первое сообщение',
    description: 'Вы опубликовали своё первое сообщение на форуме',
    icon: 'MessageSquare',
    rarity: 'rare',
  },
  forum_10_posts: {
    title: 'Активный участник',
    description: 'Вы опубликовали 10 сообщений на форуме',
    icon: 'MessageCircle',
    rarity: 'rare',
  },
  tournament_participant: {
    title: 'Участник турнира',
    description: 'Вы приняли участие в своём первом турнире',
    icon: 'Trophy',
    rarity: 'epic',
  },
  tournament_winner: {
    title: 'Победитель!',
    description: 'Вы выиграли турнир!',
    icon: 'Crown',
    rarity: 'legendary',
  },
  payment_first: {
    title: 'Первый платёж',
    description: 'Вы совершили свой первый платёж',
    icon: 'DollarSign',
    rarity: 'rare',
  },
  profile_complete: {
    title: 'Заполненный профиль',
    description: 'Вы полностью заполнили свой профиль',
    icon: 'User',
    rarity: 'common',
  },
  time_1h: {
    title: 'Первый час',
    description: 'Вы провели на сайте 1 час',
    icon: 'Clock',
    rarity: 'common',
  },
  time_10h: {
    title: 'Освоившийся',
    description: 'Вы провели на сайте 10 часов',
    icon: 'Clock',
    rarity: 'rare',
  },
  team_created: {
    title: 'Создатель команды',
    description: 'Вы создали свою первую команду',
    icon: 'Users',
    rarity: 'epic',
  },
};

export function useAchievements() {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  const getUnlockedAchievements = useCallback((): string[] => {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    const unlocked = getUnlockedAchievements();
    
    if (unlocked.includes(achievementId)) {
      return false;
    }

    const config = ACHIEVEMENTS_CONFIG[achievementId];
    if (!config) {
      console.warn(`Achievement ${achievementId} not found in config`);
      return false;
    }

    const newAchievement: Achievement = {
      id: achievementId,
      ...config,
      timestamp: Date.now(),
    };

    unlocked.push(achievementId);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));

    setCurrentAchievement(newAchievement);

    return true;
  }, [getUnlockedAchievements]);

  const closeAchievement = useCallback(() => {
    setCurrentAchievement(null);
  }, []);

  const hasAchievement = useCallback((achievementId: string): boolean => {
    return getUnlockedAchievements().includes(achievementId);
  }, [getUnlockedAchievements]);

  return {
    currentAchievement,
    unlockAchievement,
    closeAchievement,
    hasAchievement,
    getUnlockedAchievements,
  };
}
