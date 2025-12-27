import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { playHoverSound, playClickSound } from '@/utils/sounds';

interface ProfileHeaderProps {
  onNavigateHome: () => void;
  onLogout: () => void;
}

export default function ProfileHeader({ onNavigateHome, onLogout }: ProfileHeaderProps) {
  return (
    <header className="relative z-10 border-b border-primary/20 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              playClickSound();
              onNavigateHome();
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <Icon name="ArrowLeft" size={20} />
            <span className="font-bold">На главную</span>
          </Button>
          
          <Button 
            variant="destructive"
            onClick={onLogout}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-2"
          >
            <Icon name="LogOut" size={20} />
            <span className="font-bold">Выйти</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
