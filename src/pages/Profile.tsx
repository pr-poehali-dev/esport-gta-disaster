import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, User } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playSuccessSound } from '@/utils/sounds';
import CreateTeamDialog from '@/components/CreateTeamDialog';
import EditTeamDialog from '@/components/EditTeamDialog';
import DeleteTeamDialog from '@/components/DeleteTeamDialog';
import TournamentRegistrations from '@/components/TournamentRegistrations';
import ModerationPanel from '@/components/ModerationPanel';
import UserManagementPanel from '@/components/UserManagementPanel';
import AdminActions from '@/components/AdminActions';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import ProfileAchievementsCard from '@/components/profile/ProfileAchievementsCard';
import ProfileTeamCard from '@/components/profile/ProfileTeamCard';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    discord: '',
    team: ''
  });
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [showTeamManagement, setShowTeamManagement] = useState(false);

  useEffect(() => {
    loadProfile();
    loadTeam();
    loadRegistrations();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setFormData({
        nickname: profile.nickname,
        discord: profile.discord || '',
        team: profile.team || ''
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить профиль",
        variant: "destructive"
      });
      navigate('/');
    }
  };

  const handleLogout = async () => {
    playClickSound();
    await authService.logout();
    toast({
      title: "Выход выполнен",
      description: "До встречи на арене!",
    });
    navigate('/');
  };

  const loadTeam = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0', {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
      }
    } catch (error) {
      console.log('No team found');
    } finally {
      setLoadingTeam(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.log('Failed to load registrations');
    }
  };

  const handleRegisterTournament = async (tournamentName: string) => {
    playClickSound();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({ tournament_name: tournamentName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      playSuccessSound();
      toast({
        title: "✅ Регистрация завершена!",
        description: `Команда ${team?.name} зарегистрирована на турнир`,
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      loadRegistrations();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось зарегистрироваться',
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async () => {
    playClickSound();
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0', {
        method: 'DELETE',
        headers: {
          'X-User-Id': user.id?.toString() || ''
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      playSuccessSound();
      toast({
        title: "✅ Команда удалена",
        description: "Все данные команды успешно удалены",
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      setTeam(null);
      loadRegistrations();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : 'Не удалось удалить команду',
        variant: "destructive"
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updated = await authService.updateProfile(formData);
      setUser(updated);
      setIsEditing(false);
      playSuccessSound();
      
      toast({
        title: "✅ Профиль обновлен!",
        description: "Изменения успешно сохранены",
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        nickname: user.nickname,
        discord: user.discord || '',
        team: user.team || ''
      });
    }
  };

  const handleTeamUpdate = () => {
    loadTeam();
    toast({
      title: "✅ Состав обновлен!",
      description: "Изменения успешно сохранены",
      className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e] flex items-center justify-center">
        <div className="text-2xl font-bold text-primary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEzLDE0OCwyMzEsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <ProfileHeader 
        onNavigateHome={() => navigate('/')}
        onLogout={handleLogout}
      />

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-4 text-white">Личный кабинет</h1>
              <p className="text-muted-foreground">Управляйте своим профилем игрока</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ProfileInfoCard
                  user={user}
                  isEditing={isEditing}
                  formData={formData}
                  loading={loading}
                  onEdit={() => setIsEditing(true)}
                  onCancel={handleCancelEdit}
                  onUpdate={handleUpdate}
                  onFormChange={handleFormChange}
                />

                <ProfileAchievementsCard
                  user={user}
                  team={team}
                  registrations={registrations}
                  onNavigateToAchievements={() => navigate('/#achievements')}
                />

                <ProfileTeamCard
                  team={team}
                  loadingTeam={loadingTeam}
                  showTeamManagement={showTeamManagement}
                  onCreateTeam={() => setShowCreateTeam(true)}
                  onEditTeam={() => setShowEditTeam(true)}
                  onDeleteTeam={() => setShowDeleteTeam(true)}
                  onToggleTeamManagement={() => setShowTeamManagement(!showTeamManagement)}
                  onTeamUpdate={handleTeamUpdate}
                />
              </div>

              <div className="space-y-6">
                {user.is_organizer && (
                  <AdminActions username={user.nickname} userId={user.id.toString()} />
                )}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {team && (
                <Card className="border-primary/30 bg-card/80 backdrop-blur">
                  <TournamentRegistrations
                    registrations={registrations}
                    onRegister={handleRegisterTournament}
                  />
                </Card>
              )}

              {user.is_organizer && (
                <>
                  <Card className="border-primary/30 bg-card/80 backdrop-blur">
                    <ModerationPanel />
                  </Card>
                  <Card className="border-primary/30 bg-card/80 backdrop-blur">
                    <UserManagementPanel />
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <CreateTeamDialog
        open={showCreateTeam}
        onOpenChange={setShowCreateTeam}
        onSuccess={() => {
          loadTeam();
          setShowCreateTeam(false);
        }}
      />

      <EditTeamDialog
        open={showEditTeam}
        onOpenChange={setShowEditTeam}
        team={team}
        onSuccess={() => {
          loadTeam();
          setShowEditTeam(false);
        }}
      />

      <DeleteTeamDialog
        open={showDeleteTeam}
        onOpenChange={setShowDeleteTeam}
        onConfirm={() => {
          handleDeleteTeam();
          setShowDeleteTeam(false);
        }}
      />
    </div>
  );
};

export default Profile;
