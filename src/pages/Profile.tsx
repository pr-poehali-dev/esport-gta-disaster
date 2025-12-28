import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import ProfileBannerSection from '@/components/profile/ProfileBannerSection';
import ProfileStatsSection from '@/components/profile/ProfileStatsSection';
import ProfileContentSection from '@/components/profile/ProfileContentSection';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog';

const PROFILE_API_URL = 'https://functions.poehali.dev/40668e0d-ec0a-41a3-95c1-34a0140e1c15';

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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            action: 'upload_banner',
            banner_base64: base64,
            file_type: file.type
          })
        });

        const data = await response.json();

        if (response.ok) {
          setProfile({ ...profile, banner_url: data.banner_url });
          toast({
            title: 'Успешно',
            description: 'Баннер загружен'
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
        description: 'Не удалось загрузить баннер',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProfileBannerSection
            profile={profile}
            uploading={uploading}
            handleBannerUpload={handleBannerUpload}
            handleAvatarUpload={handleAvatarUpload}
            onEditClick={() => setEditDialogOpen(true)}
          />

          <div className="mt-8">
            <ProfileStatsSection profile={profile} />
            <ProfileContentSection profile={profile} />
          </div>

          <ProfileEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            editData={editData}
            setEditData={setEditData}
            handleSaveProfile={handleSaveProfile}
            loading={loading}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
