import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/NotificationBell';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('session_token');
    if (user && token) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const isAdmin = userRole === 'admin' || userRole === 'founder' || userRole === 'organizer' || userRole === 'referee';

  const isHomePage = location.pathname === '/';
  const canGoBack = window.history.length > 1 && !isHomePage;

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Вы уверены, что хотите выйти из аккаунта?');
    
    if (!confirmed) {
      return;
    }

    const sessionToken = localStorage.getItem('session_token');
    
    if (sessionToken) {
      try {
        await fetch('https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Session-Token': sessionToken
          },
          body: JSON.stringify({ action: 'logout' })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    navigate('/');
  };

  const navLinks = [
    { label: 'Новости', href: '/news', external: false },
    { label: 'Форум', href: '/forum', external: false },
    { label: 'Обсуждения', href: '/discussions', external: false },
    { label: 'Команды', href: '/teams', external: false },
    { label: 'Турниры', href: '/tournaments', external: false },
    { label: 'Рейтинг', href: '/rating', external: false },
  ];

  const socialLinks = [
    { icon: 'MessageCircle', label: 'ВКонтакте', href: 'https://vk.com/dizasterri' },
    { icon: 'Send', label: 'Telegram', href: 'https://t.me/dizasterri' },
    { icon: 'MessageSquare', label: 'Discord', href: '#' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-background via-background/98 to-background backdrop-blur-xl border-b border-primary/20 shadow-lg shadow-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            {!isHomePage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-primary/20 hover:scale-110 transition-all duration-300 flex-shrink-0 group"
                title="Назад"
              >
                <Icon name="ArrowLeft" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </Button>
            )}
          </div>

          <div className="flex-1 flex justify-center">
            <Logo showText={true} animated={true} />
          </div>

          <nav className="hidden lg:flex items-center gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-all duration-300 uppercase tracking-wide relative group whitespace-nowrap hover:scale-105"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  size="sm"
                  className="font-bold text-sm h-9 hover:bg-primary/10 hover:scale-105 transition-all duration-300"
                >
                  <Icon name="LogIn" className="h-4 w-4 mr-2" />
                  ВХОД
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  size="sm"
                  className="bg-gradient-to-r from-primary via-purple-500 to-secondary hover:shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-bold text-sm h-9"
                >
                  <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                  РЕГИСТРАЦИЯ
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  size="sm"
                  className="font-bold flex items-center gap-2 text-sm h-9 hover:bg-primary/10 hover:scale-105 transition-all duration-300 group"
                >
                  <Icon name="User" className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  ПРОФИЛЬ
                </Button>
                <NotificationBell />
                {isAdmin && (
                  <a
                    href="/admin"
                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:text-primary-foreground border border-primary/30 hover:border-primary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 font-bold text-sm uppercase tracking-wide flex items-center gap-2 h-9 whitespace-nowrap hover:scale-105 group"
                  >
                    <Icon name="Shield" className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                    АДМИН
                  </a>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="font-bold flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 hover:scale-105 transition-all duration-300 group"
                >
                  <Icon name="LogOut" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  ВЫХОД
                </Button>
              </>
            )}
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 flex items-center justify-center border border-border hover:border-primary bg-card hover:bg-gradient-to-br hover:from-primary/20 hover:to-secondary/20 transition-all duration-300 group flex-shrink-0 hover:scale-110 hover:shadow-lg hover:shadow-primary/30"
              >
                <Icon
                  name={social.icon as any}
                  className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:scale-110"
                />
              </a>
            ))}
          </div>

          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card/95 backdrop-blur-xl">
          <div className="px-4 py-6 space-y-4">
            {!isAuthenticated ? (
              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-center font-semibold"
                >
                  <Icon name="LogIn" className="h-4 w-4 mr-2" />
                  ВХОД
                </Button>
                <Button
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center bg-gradient-to-r from-primary to-secondary font-semibold"
                >
                  <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                  РЕГИСТРАЦИЯ
                </Button>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-center font-semibold"
                >
                  <Icon name="User" className="h-4 w-4 mr-2" />
                  ПРОФИЛЬ
                </Button>
                {isAdmin && (
                  <Button
                    onClick={() => {
                      navigate('/admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-center bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 font-semibold"
                  >
                    <Icon name="Shield" className="h-4 w-4 mr-2" />
                    АДМИН-ПАНЕЛЬ
                  </Button>
                )}
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full justify-center font-semibold text-muted-foreground hover:text-destructive border-destructive/30 hover:border-destructive"
                >
                  <Icon name="LogOut" className="h-4 w-4 mr-2" />
                  ВЫХОД
                </Button>
              </div>
            )}

            <div className="border-t border-border pt-4 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="block py-2 px-4 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded transition-colors uppercase tracking-wide"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-border flex justify-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-12 h-12 flex items-center justify-center border border-border hover:border-primary bg-background hover:bg-primary/10 rounded-lg transition-all duration-300"
                >
                  <Icon name={social.icon as any} className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}