import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import LevelSystem, { getUserXP } from '@/components/LevelSystem';
import ProfileInvitationsCard from '@/components/profile/ProfileInvitationsCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const PROFILE_API_URL = 'https://functions.poehali.dev/40668e0d-ec0a-41a3-95c1-34a0140e1c15';

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
  'Киберспортсмен': 'Киберспортсмен',
  'Освоившийся': 'Освоившийся',
  'Пользователь': 'Пользователь',
  'Новичок': 'Новичок'
};

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [editData, setEditData] = useState({
    nickname: '',
    discord: '',
    team: '',
    bio: '',
    signature_url: ''
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    
    const interval = setInterval(() => {
      trackActivity();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const trackActivity = async () => {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) return;

    try {
      await fetch(PROFILE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken
        },
        body: JSON.stringify({
          action: 'track_activity',
          duration_seconds: 60
        })
      });
    } catch (error) {
      console.log('Activity tracking failed');
    }
  };

  const loadProfile = async () => {
    const sessionToken = localStorage.getItem('session_token');
    
    if (!sessionToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(PROFILE_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
        setEditData({
          nickname: data.nickname || '',
          discord: data.discord || '',
          team: data.team || '',
          bio: data.bio || '',
          signature_url: data.signature_url || ''
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить профиль',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5 МБ',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        
        const sessionToken = localStorage.getItem('session_token');
        const response = await fetch(PROFILE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken!
          },
          body: JSON.stringify({
            action: 'upload_avatar',
            avatar_base64: base64,
            file_type: file.type
          })
        });

        const data = await response.json();

        if (response.ok) {
          setProfile({ ...profile, avatar_url: data.avatar_url });
          toast({
            title: 'Успешно',
            description: 'Аватар загружен'
          });
        } else {
          toast({
            title: 'Ошибка',
            description: data.error,
            variant: 'destructive'
          });
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аватар',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editData.nickname.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Имя пользователя обязательно',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(PROFILE_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken!
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Профиль обновлен'
        });
        setEditDialogOpen(false);
        loadProfile();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить профиль',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'founder': 'bg-gradient-to-r from-yellow-500 to-orange-500',
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
      'Киберспортсмен': 'bg-gradient-to-r from-purple-600 to-pink-600',
      'Освоившийся': 'bg-gradient-to-r from-blue-600 to-cyan-600',
      'Пользователь': 'bg-gradient-to-r from-green-600 to-emerald-600',
      'Новичок': 'bg-gradient-to-r from-gray-600 to-slate-600'
    };
    return colors[status] || colors['Новичок'];
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-primary/30">
            <div className="h-48 bg-gradient-to-r from-primary via-secondary to-accent relative">
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
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getStatusBadgeColor(profile.auto_status)}`}>
                      {STATUS_NAMES[profile.auto_status] || profile.auto_status}
                    </span>
                  </div>
                </div>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Icon name="Edit" size={20} />
                      Изменить информацию
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Редактирование профиля</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Имя пользователя *</label>
                        <Input
                          value={editData.nickname}
                          onChange={(e) => setEditData({ ...editData, nickname: e.target.value })}
                          placeholder="Введите имя пользователя"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Discord</label>
                        <Input
                          value={editData.discord}
                          onChange={(e) => setEditData({ ...editData, discord: e.target.value })}
                          placeholder="username#0000"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Команда</label>
                        <Input
                          value={editData.team}
                          onChange={(e) => setEditData({ ...editData, team: e.target.value })}
                          placeholder="Название команды"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">Биография</label>
                        <Textarea
                          value={editData.bio}
                          onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                          placeholder="Расскажите о себе"
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold mb-2 block">URL подписи (изображение/видео)</label>
                        <Input
                          value={editData.signature_url}
                          onChange={(e) => setEditData({ ...editData, signature_url: e.target.value })}
                          placeholder="https://example.com/signature.png"
                        />
                      </div>

                      <Button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? <Icon name="Loader2" className="animate-spin mr-2" size={20} /> : <Icon name="Save" className="mr-2" size={20} />}
                        Сохранить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <LevelSystem totalXP={getUserXP()} />

                <Card className="p-6 bg-card/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon name="Clock" size={24} className="text-primary" />
                    <h3 className="text-lg font-bold">Статистика</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Время на сайте:</span>
                      <span className="font-bold">{profile.total_time_hours} ч</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Очки достижений:</span>
                      <span className="font-bold">{profile.achievement_points || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дата регистрации:</span>
                      <span className="font-bold">{new Date(profile.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate('/achievements')}
                  >
                    <Icon name="Trophy" className="mr-2 h-4 w-4" />
                    Мои достижения
                  </Button>
                </Card>

                <Card className="p-6 bg-card/50">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon name="Users" size={24} className="text-primary" />
                    <h3 className="text-lg font-bold">Информация</h3>
                  </div>
                  <div className="space-y-3">
                    {profile.team && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Команда:</span>
                        <span className="font-bold">{profile.team}</span>
                      </div>
                    )}
                    {profile.discord && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discord:</span>
                        <span className="font-bold">{profile.discord}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-bold text-sm">{profile.email}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {profile.bio && (
                <Card className="p-6 bg-card/50 mb-6">
                  <h3 className="text-lg font-bold mb-3">О себе</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                </Card>
              )}

              {profile.signature_url && (
                <Card className="p-6 bg-card/50">
                  <h3 className="text-lg font-bold mb-3">Подпись</h3>
                  {profile.signature_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={profile.signature_url} controls className="w-full rounded-lg" />
                  ) : (
                    <img src={profile.signature_url} alt="Signature" className="w-full rounded-lg" />
                  )}
                </Card>
              )}

              <ProfileInvitationsCard userId={profile.id} />
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}