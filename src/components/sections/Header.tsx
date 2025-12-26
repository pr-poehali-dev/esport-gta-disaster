import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { playClickSound, playHoverSound } from '@/utils/sounds';
import { authService } from '@/lib/auth';

const Header = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  return (
    <header className="relative z-10 border-b border-primary/20 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-primary via-secondary to-accent rounded clip-corner flex items-center justify-center logo-pulse">
              <Icon name="Zap" className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-shine">DISASTER ESPORTS</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">ГТА Криминальная Россия</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#tournaments" onMouseEnter={playHoverSound} onClick={playClickSound} className="text-sm font-medium hover:text-primary transition-colors">Турниры</a>
            <a href="#streams" onMouseEnter={playHoverSound} onClick={playClickSound} className="text-sm font-medium hover:text-primary transition-colors">Стримы</a>
            <a href="#register" onMouseEnter={playHoverSound} onClick={playClickSound} className="text-sm font-medium hover:text-primary transition-colors">Регистрация</a>
            <a href="#ratings" onMouseEnter={playHoverSound} onClick={playClickSound} className="text-sm font-medium hover:text-primary transition-colors">Рейтинг</a>
            <a href="#rules" onMouseEnter={playHoverSound} onClick={playClickSound} className="text-sm font-medium hover:text-primary transition-colors">Правила</a>
            {isAuthenticated ? (
              <Button 
                onClick={() => {
                  playClickSound();
                  navigate('/profile');
                }}
                onMouseEnter={playHoverSound}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-bold"
              >
                <Icon name="User" className="mr-2" size={18} />
                Профиль
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  playClickSound();
                  navigate('/auth');
                }}
                onMouseEnter={playHoverSound}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-bold"
              >
                <Icon name="LogIn" className="mr-2" size={18} />
                Войти
              </Button>
            )}
          </nav>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-primary">
                <Icon name="Menu" size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-primary/30">
              <nav className="flex flex-col gap-6 mt-8">
                <a href="#tournaments" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold hover:text-primary transition-colors">Турниры</a>
                <a href="#streams" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold hover:text-primary transition-colors">Стримы</a>
                <a href="#register" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold hover:text-primary transition-colors">Регистрация</a>
                <a href="#ratings" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold hover:text-primary transition-colors">Рейтинг</a>
                <a href="#rules" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold hover:text-primary transition-colors">Правила</a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;