import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LevelData {
  level: number;
  currentXP: number;
  requiredXP: number;
  percentage: number;
}

const XP_PER_LEVEL = 1000;
const XP_SCALING = 1.5;

function calculateLevel(totalXP: number): LevelData {
  let level = 1;
  let xpForNextLevel = XP_PER_LEVEL;
  let remainingXP = totalXP;

  while (remainingXP >= xpForNextLevel) {
    remainingXP -= xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(XP_PER_LEVEL * Math.pow(XP_SCALING, level - 1));
  }

  return {
    level,
    currentXP: remainingXP,
    requiredXP: xpForNextLevel,
    percentage: Math.round((remainingXP / xpForNextLevel) * 100)
  };
}

function getLevelTitle(level: number): string {
  if (level >= 100) return 'Легенда';
  if (level >= 75) return 'Мастер';
  if (level >= 50) return 'Эксперт';
  if (level >= 30) return 'Ветеран';
  if (level >= 20) return 'Опытный';
  if (level >= 10) return 'Продвинутый';
  if (level >= 5) return 'Начинающий';
  return 'Новичок';
}

function getLevelColor(level: number): string {
  if (level >= 100) return 'from-yellow-500 to-orange-500';
  if (level >= 75) return 'from-purple-500 to-pink-500';
  if (level >= 50) return 'from-blue-500 to-cyan-500';
  if (level >= 30) return 'from-green-500 to-emerald-500';
  if (level >= 20) return 'from-teal-500 to-cyan-500';
  if (level >= 10) return 'from-indigo-500 to-purple-500';
  if (level >= 5) return 'from-slate-500 to-gray-500';
  return 'from-gray-600 to-gray-700';
}

interface LevelSystemProps {
  totalXP?: number;
  compact?: boolean;
}

export default function LevelSystem({ totalXP = 0, compact = false }: LevelSystemProps) {
  const [levelData, setLevelData] = useState<LevelData>(calculateLevel(totalXP));

  useEffect(() => {
    setLevelData(calculateLevel(totalXP));
  }, [totalXP]);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getLevelColor(levelData.level)} flex items-center justify-center font-black text-white text-lg shadow-lg`}>
          {levelData.level}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold">{getLevelTitle(levelData.level)}</span>
            <span className="text-xs text-muted-foreground">
              {levelData.currentXP} / {levelData.requiredXP} XP
            </span>
          </div>
          <Progress value={levelData.percentage} className="h-2" />
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 bg-card/50">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getLevelColor(levelData.level)} flex items-center justify-center font-black text-white text-3xl shadow-xl relative`}>
          {levelData.level}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background flex items-center justify-center">
            <Icon name="Star" className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black mb-1">{getLevelTitle(levelData.level)}</h3>
          <p className="text-sm text-muted-foreground">Уровень {levelData.level}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Прогресс до уровня {levelData.level + 1}</span>
          <span className="font-bold">{levelData.percentage}%</span>
        </div>
        <Progress value={levelData.percentage} className="h-3" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{levelData.currentXP} XP</span>
          <span>{levelData.requiredXP} XP</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="TrendingUp" className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            Осталось <span className="font-bold text-foreground">{levelData.requiredXP - levelData.currentXP} XP</span> до следующего уровня
          </span>
        </div>
      </div>
    </Card>
  );
}

export function addXP(amount: number) {
  const currentXP = parseInt(localStorage.getItem('user_xp') || '0');
  const newXP = currentXP + amount;
  localStorage.setItem('user_xp', newXP.toString());
  
  const oldLevel = calculateLevel(currentXP).level;
  const newLevel = calculateLevel(newXP).level;
  
  if (newLevel > oldLevel) {
    import('./AchievementSystem').then(({ unlockAchievement }) => {
      if (newLevel >= 10) unlockAchievement('level_10');
      if (newLevel >= 25) unlockAchievement('level_25');
      if (newLevel >= 50) unlockAchievement('level_50');
      if (newLevel >= 100) unlockAchievement('level_100');
    });
  }
  
  return {
    xpGained: amount,
    totalXP: newXP,
    leveledUp: newLevel > oldLevel,
    newLevel: newLevel
  };
}

export function getUserXP(): number {
  return parseInt(localStorage.getItem('user_xp') || '0');
}

export const XP_REWARDS = {
  REGISTRATION: 100,
  EMAIL_VERIFIED: 200,
  FIRST_POST: 50,
  FIRST_TOPIC: 100,
  TOURNAMENT_JOIN: 300,
  TOURNAMENT_WIN: 1000,
  DAILY_LOGIN: 20,
  PROFILE_COMPLETE: 150,
  ACHIEVEMENT_UNLOCK: 50,
  HOUR_ONLINE: 10
};