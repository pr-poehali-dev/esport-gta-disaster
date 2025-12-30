import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('session_token');
      
      if (user && token) {
        try {
          const userData = JSON.parse(user);
          setUserRole(userData.role);
          setIsAuthenticated(true);
          
          // Обновляем данные пользователя из API (включая роль)
          try {
            const response = await fetch('https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                const updatedUser = { ...userData, ...data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUserRole(updatedUser.role);
              }
            }
          } catch (e) {
            // Если не удалось обновить - продолжаем с текущими данными
            console.log('Failed to refresh user data');
          }
        } catch (e) {
          console.error('Failed to parse user data');
        }
      }
    };
    
    checkAuth();
  }, []);

  const isAdmin = userRole === 'admin' || userRole === 'founder' || userRole === 'organizer';

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
    { label: 'Обсуждения', href: '/forum', external: false },
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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          <div className="flex items-center gap-4">
            {!isHomePage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-primary/10"
                title="Назад"
              >
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-shrink-0">
              <Logo showText={true} animated={true} />
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="font-semibold"
                >
                  <Icon name="LogIn" className="h-4 w-4 mr-2" />
                  ВХОД
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-primary to-secondary"
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
                  className="font-semibold flex items-center gap-2"
                >
                  <Icon name="User" className="h-4 w-4" />
                  ПРОФИЛЬ
                </Button>
                {isAdmin && (
                  <a
                    href="/admin"
                    className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all duration-300 font-semibold text-sm uppercase tracking-wide flex items-center gap-2"
                  >
                    <Icon name="Shield" className="h-4 w-4" />
                    Админ-Панель
                  </a>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="font-semibold flex items-center gap-2 text-muted-foreground hover:text-destructive"
                >
                  <Icon name="LogOut" className="h-4 w-4" />
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
                className="w-10 h-10 flex items-center justify-center border border-border hover:border-primary bg-card hover:bg-primary/10 transition-all duration-300 group"
              >
                <Icon
                  name={social.icon as any}
                  className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
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