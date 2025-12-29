import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UserRoleBadgeProps {
  role: string;
  autoStatus?: string;
  showIcon?: boolean;
}

export default function UserRoleBadge({ role, autoStatus, showIcon = true }: UserRoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    const configs: Record<string, { 
      label: string; 
      variant: "default" | "secondary" | "destructive" | "outline"; 
      icon: string;
      color: string;
    }> = {
      founder: { 
        label: 'Основатель', 
        variant: 'destructive', 
        icon: 'Crown',
        color: 'text-white'
      },
      director: { 
        label: 'Руководитель', 
        variant: 'default', 
        icon: 'Shield',
        color: 'text-purple-500'
      },
      admin: { 
        label: 'Администратор', 
        variant: 'destructive', 
        icon: 'ShieldCheck',
        color: 'text-red-500'
      },
      moderator: { 
        label: 'Модератор', 
        variant: 'secondary', 
        icon: 'ShieldAlert',
        color: 'text-blue-500'
      },
      media_partner: { 
        label: 'Медиа-партнёр', 
        variant: 'outline', 
        icon: 'Radio',
        color: 'text-pink-500'
      },
      author: { 
        label: 'Автор', 
        variant: 'outline', 
        icon: 'Pencil',
        color: 'text-green-500'
      },
      authority: { 
        label: 'Авторитет', 
        variant: 'outline', 
        icon: 'Star',
        color: 'text-amber-500'
      },
      cybersportsman: { 
        label: 'Киберспортсмен', 
        variant: 'outline', 
        icon: 'Trophy',
        color: 'text-cyan-500'
      },
      organizer: { 
        label: 'Организатор', 
        variant: 'secondary', 
        icon: 'Calendar',
        color: 'text-indigo-500'
      },
      user: { 
        label: 'Пользователь', 
        variant: 'outline', 
        icon: 'User',
        color: 'text-gray-500'
      }
    };
    return configs[role] || configs.user;
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      label: string; 
      variant: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }> = {
      'Разработчик': { label: 'Разработчик', variant: 'default', className: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0' },
      'Освоившийся': { label: 'Освоившийся', variant: 'default' },
      'Пользователь': { label: 'Пользователь', variant: 'secondary' },
      'Новичок': { label: 'Новичок', variant: 'outline' }
    };
    return configs[status] || configs['Новичок'];
  };

  const roleConfig = getRoleConfig(role);
  const statusConfig = autoStatus ? getStatusConfig(autoStatus) : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge variant={roleConfig.variant} className="flex items-center gap-1">
        {showIcon && <Icon name={roleConfig.icon} className={`h-3 w-3 ${roleConfig.color}`} />}
        {roleConfig.label}
      </Badge>
      {statusConfig && (
        <Badge variant={statusConfig.variant} className={`text-xs ${statusConfig.className || ''}`}>
          {statusConfig.label}
        </Badge>
      )}
    </div>
  );
}