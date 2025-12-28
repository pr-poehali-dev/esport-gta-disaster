import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const LEVEL_COLORS: Record<number, string> = {
  1: '#FFFFFF',
  2: '#90EE90',
  3: '#00FF00',
  4: '#006400',
  5: '#FFC0CB',
  6: '#FF1493',
  7: '#FFA500',
  8: '#FF6347',
  9: '#FF0000',
  10: '#8B0000'
};

interface LevelUpAnimationProps {
  level: number;
  teamName: string;
  onClose: () => void;
}

export default function LevelUpAnimation({ level, teamName, onClose }: LevelUpAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 500);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
      <Card className="p-12 text-center max-w-lg animate-in zoom-in-95 duration-500">
        <div className="mb-6 animate-bounce">
          <Icon name="Trophy" className="h-24 w-24 mx-auto" style={{ color: LEVEL_COLORS[level] }} />
        </div>

        <h1 
          className="text-6xl font-black mb-4"
          style={{ color: LEVEL_COLORS[level] }}
        >
          LEVEL {level}
        </h1>

        <h2 className="text-2xl font-bold mb-2">{teamName}</h2>
        <p className="text-muted-foreground mb-6">достигла нового уровня!</p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full transition-all ${
                  i < level ? 'scale-100' : 'scale-75 opacity-30'
                }`}
                style={{
                  backgroundColor: i < level ? LEVEL_COLORS[i + 1] : '#666'
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>✨ Команда становится сильнее</p>
          <p>🏆 Новые возможности разблокированы</p>
          <p>⭐ Престиж команды повышен</p>
        </div>
      </Card>
    </div>
  );
}
