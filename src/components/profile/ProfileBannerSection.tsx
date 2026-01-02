import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ROLE_NAMES: Record<string, string> = {
  'founder': 'Основатель',
  'director': 'Руководитель',
  'admin': 'Администратор',
  'moderator': 'Модератор',
  'chief_judge': 'Главный судья',
  'legend': 'Легенда',
  'authority': 'Авторитет',
  'user': 'Пользователь'
};

const STATUS_NAMES: Record<string, string> = {
  'Разработчик': 'Разработчик',
  'Киберспортсмен': 'Киберспортсмен',
  'Освоившийся': 'Освоившийся',
  'Пользователь': 'Пользователь',
  'Новичок': 'Новичок'
};

interface ProfileBannerSectionProps {
  profile: any;
  uploading: boolean;
  handleBannerUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEditClick: () => void;
  onRefreshData?: () => void;
  onChangePassword?: () => void;
  onViewLoginHistory?: () => void;
}

export default function ProfileBannerSection({
  profile,
  uploading,
  handleBannerUpload,
  handleAvatarUpload,
  onEditClick,
  onRefreshData,
  onChangePassword,
  onViewLoginHistory,
}: ProfileBannerSectionProps) {
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'founder': 'bg-gradient-to-r from-red-600 to-red-800',
      'director': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'admin': 'bg-gradient-to-r from-red-500 to-pink-600',
      'moderator': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'chief_judge': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'legend': 'bg-gradient-to-r from-indigo-500 to-purple-500',
      'authority': 'bg-gradient-to-r from-teal-500 to-cyan-500',
      'user': 'bg-gradient-to-r from-gray-600 to-gray-700'
    };
    return colors[role] || colors['user'];
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'Разработчик': 'bg-gradient-to-r from-blue-600 to-cyan-600',
      'Киберспортсмен': 'bg-gradient-to-r from-purple-600 to-pink-600',
      'Освоившийся': 'bg-gradient-to-r from-green-600 to-emerald-600',
      'Пользователь': 'bg-gradient-to-r from-green-600 to-emerald-600',
      'Новичок': 'bg-gradient-to-r from-gray-600 to-slate-600'
    };
    return colors[status] || colors['Новичок'];
  };

  return (
    <Card className="overflow-hidden border-primary/30">
      <div className="h-48 relative group">
        {profile.banner_url ? (
          <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary via-secondary to-accent" />
        )}
        <label className="absolute top-4 right-4 px-4 py-2 bg-background/80 backdrop-blur-sm rounded cursor-pointer hover:bg-background transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-2">
          <Icon name="ImagePlus" size={18} />
          <span className="text-sm font-medium">Загрузить баннер</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-card">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Icon name="User" size={48} />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
              <Icon name="Camera" size={20} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="pt-20 px-8 pb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{profile.nickname}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getRoleBadgeColor(profile.role)}`}>
                {ROLE_NAMES[profile.role] || profile.role}
              </span>
              <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getStatusBadgeColor(profile.custom_title || profile.auto_status)}`}>
                {profile.custom_title || STATUS_NAMES[profile.auto_status] || profile.auto_status}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {onViewLoginHistory && (
              <Button variant="outline" className="gap-2" onClick={onViewLoginHistory}>
                <Icon name="Shield" size={20} />
                История входов
              </Button>
            )}
            {onChangePassword && (
              <Button variant="outline" className="gap-2" onClick={onChangePassword}>
                <Icon name="Lock" size={20} />
                Сменить пароль
              </Button>
            )}
            {onRefreshData && (
              <Button variant="outline" className="gap-2" onClick={onRefreshData}>
                <Icon name="RefreshCw" size={20} />
                Обновить данные
              </Button>
            )}
            <Button className="gap-2" onClick={onEditClick}>
              <Icon name="Edit" size={20} />
              Изменить информацию
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}