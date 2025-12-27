import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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

  const isAdmin = userRole === 'admin' || userRole === 'founder' || userRole === 'organizer';

  const navLinks = [
    { label: 'Обсуждения', href: '#', external: true },
    { label: 'Команды', href: '/teams', external: false },
    { label: 'Турниры', href: '/tournaments', external: false },
    { label: 'Рейтинг', href: '/rating', external: false },
    { label: 'Поддержка', href: '#', external: true },
    { label: 'Правила турниров', href: '#', external: true },
  ];

  const socialLinks = [
    { icon: 'MessageCircle', label: 'ВКонтакте', href: 'https://vk.com/dizasterri' },
    { icon: 'Send', label: 'Telegram', href: 'https://t.me/dizasterri' },
    { icon: 'MessageSquare', label: 'Discord', href: '#' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          <div className="flex-shrink-0">
            <Logo showText={true} animated={true} />
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide relative group"
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
        <div className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="block text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isAdmin && (
              <a
                href="/admin"
                className="block px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 transition-all duration-300 font-semibold text-sm uppercase tracking-wide text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon name="Shield" className="h-4 w-4 inline mr-2" />
                Админ-Панель
              </a>
            )}
            <div className="pt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center border border-border hover:border-primary bg-background hover:bg-primary/10 transition-all duration-300"
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