import { useState, useEffect } from 'react';
import Logo from './Logo';
import Icon from '@/components/ui/icon';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Главная', href: '#hero' },
    { label: 'Команда', href: '#team' },
    { label: 'Матчи', href: '#matches' },
    { label: 'Достижения', href: '#achievements' },
    { label: 'Магазин', href: '#shop' },
    { label: 'Спонсоры', href: '#sponsors' },
    { label: 'Контакты', href: '#contacts' },
  ];

  const socials = [
    { icon: 'Twitch', label: 'Twitch', href: '#' },
    { icon: 'Twitter', label: 'Twitter', href: '#' },
    { icon: 'Youtube', label: 'YouTube', href: '#' },
    { icon: 'MessageCircle', label: 'Discord', href: '#' },
  ];

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Logo showText={true} animated={true} />

            <button
              className="p-2 text-foreground hover:text-primary transition-colors z-50 relative group"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-8 h-6 flex flex-col justify-between relative">
                <span
                  className={`w-full h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-2.5' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`w-full h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 scanline opacity-10" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-8">
          <nav className="space-y-2 mb-16">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className={`block text-6xl md:text-7xl lg:text-8xl font-black text-foreground hover:text-gradient transition-all duration-300 relative group ${
                  isMenuOpen ? 'animate-fade-in-up' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <span className="relative glitch-text" data-text={link.label}>
                  {link.label}
                </span>
                <span className="absolute left-0 -bottom-2 w-0 h-1 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-500" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            {socials.map((social, index) => (
              <a
                key={social.label}
                href={social.href}
                className={`w-12 h-12 flex items-center justify-center border border-border hover:border-primary bg-card hover:bg-primary/10 transition-all duration-300 group ${
                  isMenuOpen ? 'animate-scale-in' : ''
                }`}
                style={{
                  animationDelay: `${700 + index * 100}ms`,
                  animationFillMode: 'backwards',
                }}
                aria-label={social.label}
              >
                <Icon
                  name={social.icon as any}
                  className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
                />
              </a>
            ))}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
              Disaster Esports © 2024
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
