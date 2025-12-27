import Logo from './Logo';
import Icon from '@/components/ui/icon';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo showText={true} animated={false} />
            <p className="text-sm text-muted-foreground font-mono">
              © 2024 DISASTER ESPORTS
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Политика конфиденциальности
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Пользовательское соглашение
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}