import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface OrganizerBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
}

const OrganizerBadge = ({ size = 'md', variant = 'default', className }: OrganizerBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  if (variant === 'compact') {
    return (
      <Badge
        className={cn(
          'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          'text-yellow-400 border-yellow-500/50',
          'font-bold',
          sizeClasses[size],
          className
        )}
      >
        <Icon name="Crown" size={iconSizes[size]} className="mr-1" />
        {size !== 'sm' && 'Организатор'}
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
        'text-yellow-400 border-yellow-500/50',
        'font-bold animate-pulse-subtle',
        sizeClasses[size],
        className
      )}
    >
      <Icon name="Crown" size={iconSizes[size]} className="mr-1.5 animate-bounce-subtle" />
      Организатор турнира
    </Badge>
  );
};

export default OrganizerBadge;
