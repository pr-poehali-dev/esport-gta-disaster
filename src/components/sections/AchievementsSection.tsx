import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import AchievementBadge from '@/components/AchievementBadge';
import AchievementUnlockModal from '@/components/AchievementUnlockModal';
import { playHoverSound } from '@/utils/sounds';

interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
}

const AchievementsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [unlockedAchievement, setUnlockedAchievement] = useState<{
    icon: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
  } | null>(null);

  const mockAchievements: Achievement[] = [
    {
      id: 1,
      code: 'first_blood',
      name: 'Первая кровь',
      description: 'Одержи свою первую победу в турнире',
      icon: '⚔️',
      rarity: 'common',
      category: 'wins',
      points: 10,
      unlocked: true,
      unlockedAt: '2025-01-15T10:30:00Z'
    },
    {
      id: 2,
      code: 'win_streak_5',
      name: 'Неудержимый',
      description: 'Одержи 5 побед подряд',
      icon: '🔥',
      rarity: 'rare',
      category: 'wins',
      points: 50,
      unlocked: true,
      unlockedAt: '2025-01-18T14:20:00Z'
    },
    {
      id: 3,
      code: 'win_streak_10',
      name: 'Легенда',
      description: 'Одержи 10 побед подряд',
      icon: '⚡',
      rarity: 'epic',
      category: 'wins',
      points: 100,
      unlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: 4,
      code: 'season_champion',
      name: 'Чемпион сезона',
      description: 'Стань победителем турнира сезона',
      icon: '🏆',
      rarity: 'legendary',
      category: 'tournament',
      points: 500,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 5,
      code: 'perfect_game',
      name: 'Безупречная игра',
      description: 'Выиграй матч со счетом 3:0',
      icon: '💎',
      rarity: 'rare',
      category: 'wins',
      points: 30,
      unlocked: true,
      unlockedAt: '2025-01-16T16:45:00Z'
    },
    {
      id: 6,
      code: 'comeback_king',
      name: 'Король камбэков',
      description: 'Выиграй матч, проигрывая 0:2',
      icon: '👑',
      rarity: 'epic',
      category: 'wins',
      points: 75,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    },
    {
      id: 7,
      code: 'tournament_veteran',
      name: 'Ветеран турниров',
      description: 'Участвуй в 10 турнирах',
      icon: '🎖️',
      rarity: 'rare',
      category: 'participation',
      points: 40,
      unlocked: false,
      progress: 3,
      maxProgress: 10
    },
    {
      id: 8,
      code: 'rising_star',
      name: 'Восходящая звезда',
      description: 'Войди в топ-10 рейтинга',
      icon: '⭐',
      rarity: 'epic',
      category: 'rating',
      points: 80,
      unlocked: false,
      progress: 15,
      maxProgress: 1
    },
    {
      id: 9,
      code: 'first_tournament',
      name: 'Первый турнир',
      description: 'Зарегистрируйся на свой первый турнир',
      icon: '🎮',
      rarity: 'common',
      category: 'participation',
      points: 5,
      unlocked: true,
      unlockedAt: '2025-01-10T09:00:00Z'
    },
    {
      id: 10,
      code: 'undefeated',
      name: 'Непобедимый',
      description: 'Выиграй турнир без единого поражения',
      icon: '🛡️',
      rarity: 'legendary',
      category: 'tournament',
      points: 300,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    }
  ];

  const categories = [
    { value: 'all', label: 'Все', icon: 'Grid' },
    { value: 'wins', label: 'Победы', icon: 'Swords' },
    { value: 'tournament', label: 'Турниры', icon: 'Trophy' },
    { value: 'participation', label: 'Участие', icon: 'Users' },
    { value: 'rating', label: 'Рейтинг', icon: 'TrendingUp' },
    { value: 'performance', label: 'Результаты', icon: 'Target' }
  ];

  const filteredAchievements =
    selectedCategory === 'all'
      ? mockAchievements
      : mockAchievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = mockAchievements.filter((a) => a.unlocked).length;
  const totalPoints = mockAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <section id="achievements" className="relative z-10 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black mb-4 text-white">Достижения</h3>
          <p className="text-muted-foreground">Получай награды за успехи в турнирах</p>
        </div>

        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-primary/30 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded clip-corner flex items-center justify-center">
                    <Icon name="Award" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Получено</p>
                    <p className="text-2xl font-black text-white">
                      {unlockedCount}/{mockAchievements.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded clip-corner flex items-center justify-center">
                    <Icon name="Star" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Очки</p>
                    <p className="text-2xl font-black text-white">{totalPoints}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-card/80 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded clip-corner flex items-center justify-center">
                    <Icon name="TrendingUp" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Прогресс</p>
                    <p className="text-2xl font-black text-white">
                      {Math.round((unlockedCount / mockAchievements.length) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="max-w-7xl mx-auto border-primary/30 bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Award" className="text-primary" size={24} />
              Коллекция достижений
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
                    <Icon name={cat.icon as any} size={14} className="mr-1" />
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-0">
                {filteredAchievements.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAchievements.map((achievement) => (
                      <AchievementBadge
                        key={achievement.id}
                        icon={achievement.icon}
                        name={achievement.name}
                        description={achievement.description}
                        rarity={achievement.rarity}
                        unlocked={achievement.unlocked}
                        progress={achievement.progress}
                        maxProgress={achievement.maxProgress}
                        points={achievement.points}
                        unlockedAt={achievement.unlockedAt}
                        size="md"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="Trophy" size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">
                      В этой категории пока нет достижений
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-primary/20">
              <div className="flex flex-wrap gap-3 items-center justify-center mb-4">
                <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/50">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                  Обычное
                </Badge>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/50">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                  Редкое
                </Badge>
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/50">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                  Эпическое
                </Badge>
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/50">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                  Легендарное
                </Badge>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground mb-3">Тест анимации разблокировки:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUnlockedAchievement({
                        icon: '⚔️',
                        name: 'Первая кровь',
                        description: 'Одержи свою первую победу в турнире',
                        rarity: 'common',
                        points: 10
                      });
                    }}
                    onMouseEnter={playHoverSound}
                    className="border-gray-500/50 text-gray-400"
                  >
                    Обычное
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUnlockedAchievement({
                        icon: '🔥',
                        name: 'Неудержимый',
                        description: 'Одержи 5 побед подряд',
                        rarity: 'rare',
                        points: 50
                      });
                    }}
                    onMouseEnter={playHoverSound}
                    className="border-blue-500/50 text-blue-400"
                  >
                    Редкое
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUnlockedAchievement({
                        icon: '⚡',
                        name: 'Легенда',
                        description: 'Одержи 10 побед подряд',
                        rarity: 'epic',
                        points: 100
                      });
                    }}
                    onMouseEnter={playHoverSound}
                    className="border-purple-500/50 text-purple-400"
                  >
                    Эпическое
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUnlockedAchievement({
                        icon: '🏆',
                        name: 'Чемпион сезона',
                        description: 'Стань победителем турнира сезона',
                        rarity: 'legendary',
                        points: 500
                      });
                    }}
                    onMouseEnter={playHoverSound}
                    className="border-yellow-500/50 text-yellow-400"
                  >
                    Легендарное
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AchievementUnlockModal
        isOpen={!!unlockedAchievement}
        onClose={() => setUnlockedAchievement(null)}
        achievement={unlockedAchievement}
      />
    </section>
  );
};

export default AchievementsSection;