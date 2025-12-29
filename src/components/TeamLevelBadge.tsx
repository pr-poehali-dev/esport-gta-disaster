interface TeamLevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function TeamLevelBadge({ level, size = 'md' }: TeamLevelBadgeProps) {
  const clampedLevel = Math.min(Math.max(level, 1), 10);
  
  const colors = {
    1: 'from-gray-500 to-gray-600',
    2: 'from-green-500 to-green-600',
    3: 'from-blue-500 to-blue-600',
    4: 'from-cyan-500 to-cyan-600',
    5: 'from-purple-500 to-purple-600',
    6: 'from-pink-500 to-pink-600',
    7: 'from-orange-500 to-orange-600',
    8: 'from-red-500 to-red-600',
    9: 'from-yellow-500 to-yellow-600',
    10: 'from-amber-500 via-yellow-400 to-amber-600',
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  const borderWidths = {
    sm: 'border-2',
    md: 'border-[3px]',
    lg: 'border-4',
  };

  const gradient = colors[clampedLevel as keyof typeof colors];

  return (
    <div
      className={`${sizes[size]} ${borderWidths[size]} rounded-full flex items-center justify-center font-bold bg-gradient-to-br ${gradient} shadow-lg relative`}
      style={{
        borderColor: 'currentColor',
      }}
      title={`Уровень ${clampedLevel}`}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
      <span className="relative z-10 text-white drop-shadow-md">{clampedLevel}</span>
    </div>
  );
}
