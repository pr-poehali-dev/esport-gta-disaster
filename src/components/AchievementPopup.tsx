import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/icon';
import NotificationSound from './NotificationSound';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  timestamp: number;
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    if (achievement) {
      setPlaySound(true);
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  const rarityConfig = {
    common: {
      gradient: 'from-gray-500 to-gray-700',
      glow: 'shadow-gray-500/50',
      border: 'border-gray-500',
    },
    rare: {
      gradient: 'from-blue-500 to-blue-700',
      glow: 'shadow-blue-500/50',
      border: 'border-blue-500',
    },
    epic: {
      gradient: 'from-purple-500 to-purple-700',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-500',
    },
    legendary: {
      gradient: 'from-yellow-500 to-orange-600',
      glow: 'shadow-yellow-500/50',
      border: 'border-yellow-500',
    },
  };

  if (!achievement) return null;

  const config = rarityConfig[achievement.rarity];

  return (
    <>
      <NotificationSound play={playSound} onEnd={() => setPlaySound(false)} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.5 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300 
          }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-auto"
        >
          <div className={`relative bg-gradient-to-r ${config.gradient} p-1 rounded-2xl ${config.glow} shadow-2xl`}>
            <div className="bg-gray-900 rounded-xl p-6 min-w-[400px] max-w-md">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
              >
                <Icon name="X" size={20} />
              </button>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
                className="flex justify-center mb-4"
              >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center ${config.glow} shadow-lg`}>
                  <Icon name={achievement.icon as any} size={40} className="text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                  Достижение получено!
                </p>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {achievement.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {achievement.description}
                </p>
                <div className={`inline-block px-4 py-1 rounded-full border ${config.border} ${config.glow}`}>
                  <span className="text-xs font-bold text-white uppercase">
                    {achievement.rarity}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 5.4 }}
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${config.gradient} rounded-b-xl`}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200,
                  y: Math.random() * 100 + 50,
                  opacity: 0,
                  scale: 0
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-gradient-to-br ${config.gradient}`}
                style={{
                  boxShadow: `0 0 10px currentColor`
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
