import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  DashboardSection,
  UsersSection,
  BansSection,
  MutesSection,
  SuspensionsSection,
  ContentSection,
  TournamentsSection,
  NewsSection,
  ModerationSection,
  SupportSection,
  SettingsSection,
  RolesSection,
  DiscussionsSection,
} from '@/components/admin/AdminSections';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      if (!['admin', 'founder', 'moderator'].includes(userData.role)) {
        toast({
          title: 'Доступ запрещен',
          description: 'У вас нет прав администратора',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }
      
      const savedAuth = sessionStorage.getItem('adminAuth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } else {
      navigate('/login');
    }
  }, []);

  const handleLogin = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user?.id?.toString() || '1'
        },
        body: JSON.stringify({
          action: 'verify_admin_password',
          admin_id: user?.id,
          password: password
        })
      });

      const data = await response.json();
      console.log('Admin login response:', { status: response.status, data });

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminAuth', 'true');
        toast({
          title: 'Успешный вход',
          description: 'Добро пожаловать в админ-панель',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Неверный пароль',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    sessionStorage.removeItem('adminAuth');
    toast({
      title: 'Выход выполнен',
      description: 'Вы вышли из админ-панели',
    });
  };

  if (!isAuthenticated) {
    return (
      <AdminLogin
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        onNavigateHome={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-8">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <UsersSection />
              <button
                onClick={() => navigate('/admin/users')}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
              >
                Управление ролями и статусами →
              </button>
            </div>
          )}
          {activeSection === 'bans' && <BansSection />}
          {activeSection === 'mutes' && <MutesSection />}
          {activeSection === 'suspensions' && <SuspensionsSection />}
          {activeSection === 'content' && <ContentSection />}
          {activeSection === 'tournaments' && <TournamentsSection />}
          {activeSection === 'news' && <NewsSection />}
          {activeSection === 'roles' && <RolesSection />}
          {activeSection === 'discussions' && <DiscussionsSection />}
          {activeSection === 'moderation' && <ModerationSection />}
          {activeSection === 'support' && <SupportSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </main>
      </div>

      <Footer />
    </div>
  );
}