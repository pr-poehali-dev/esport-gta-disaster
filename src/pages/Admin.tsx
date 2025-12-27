import { useState } from 'react';
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
} from '@/components/admin/AdminSections';

const ADMIN_PASSWORD = 'disaster2025admin';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: 'Успешный вход',
        description: 'Добро пожаловать в админ-панель',
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный пароль',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
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
          {activeSection === 'moderation' && <ModerationSection />}
          {activeSection === 'support' && <SupportSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </main>
      </div>

      <Footer />
    </div>
  );
}