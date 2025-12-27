import { useState } from 'react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Команда', href: '#team' },
    { label: 'Матчи', href: '#matches' },
    { label: 'Достижения', href: '#achievements' },
    { label: 'Новости', href: '#news' },
    { label: 'Спонсоры', href: '#sponsors' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo showText={true} animated={true} />

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Icon name="Trophy" className="mr-2 h-4 w-4" />
              Магазин
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-background font-bold">
              Стать игроком
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon name={isMenuOpen ? 'X' : 'Menu'} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Icon name="Trophy" className="mr-2 h-4 w-4" />
                Магазин
              </Button>
              <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary text-background font-bold">
                Стать игроком
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
