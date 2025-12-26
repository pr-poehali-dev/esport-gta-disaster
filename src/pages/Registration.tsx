import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playHoverSound } from '@/utils/sounds';
import RegistrationForm from '@/components/registration/RegistrationForm';
import UserRegistrationsList from '@/components/registration/UserRegistrationsList';
import ModerationPanel from '@/components/registration/ModerationPanel';

interface Registration {
  id: number;
  team_id: number;
  team_name: string;
  logo_url: string;
  tournament_name: string;
  captain_nickname: string;
  discord_contact: string;
  comment: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_comment?: string;
  registered_at: string;
}

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!userData.id) {
        toast({
          title: 'Ошибка',
          description: 'Необходимо войти в систему',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      setUser(userData);

      const regResponse = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        headers: { 'X-User-Id': userData.id?.toString() || '' }
      });
      
      if (regResponse.ok) {
        const regData = await regResponse.json();
        setRegistrations(regData);
      }

      if (userData.is_organizer || userData.user_status === 'Главный администратор' || userData.user_status === 'Администратор' || userData.user_status === 'Модератор') {
        const allRegResponse = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53?action=all', {
          headers: { 'X-User-Id': userData.id?.toString() || '' }
        });
        
        if (allRegResponse.ok) {
          const allRegData = await allRegResponse.json();
          setAllRegistrations(allRegData);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (registrationId: number, status: 'approved' | 'rejected', comment?: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          registration_id: registrationId,
          moderation_status: status,
          moderation_comment: comment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: '✅ Статус обновлен',
        description: `Заявка ${status === 'approved' ? 'одобрена' : 'отклонена'}`,
        className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус заявки',
        variant: 'destructive'
      });
    }
  };

  const isAdmin = user?.is_organizer || user?.user_status === 'Главный администратор' || user?.user_status === 'Администратор' || user?.user_status === 'Модератор';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e] flex items-center justify-center">
        <div className="text-2xl font-bold text-primary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEzLDE0OCwyMzEsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <header className="relative z-10 border-b border-primary/20 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <Icon name="ArrowLeft" size={20} />
              <span className="font-bold">На главную</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-2 border-primary/30"
            >
              <Icon name="User" size={20} />
              <span className="font-bold">Профиль</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  РЕГИСТРАЦИЯ НА ТУРНИР
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">Подайте заявку от своей команды на участие</p>
            </div>

            <div className="grid gap-6">
              {!isAdmin && (
                <>
                  <RegistrationForm 
                    user={user}
                    onSubmitSuccess={loadData}
                  />
                  <UserRegistrationsList registrations={registrations} />
                </>
              )}

              {isAdmin && (
                <ModerationPanel
                  allRegistrations={allRegistrations}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;