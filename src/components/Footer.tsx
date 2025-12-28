import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<string>('ru');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'ru';
    setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    localStorage.setItem('language', newLang);
    window.location.reload();
  };

  const t = (ru: string, en: string) => (lang === 'en' ? en : ru);

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo showText={true} animated={false} />
            <p className="text-sm text-muted-foreground font-mono">
              © 2025 Disaster Esports
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a
              onClick={() => navigate('/rules')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {t('Правила', 'Rules')}
            </a>
            <a
              onClick={() => navigate('/support')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {t('Поддержка', 'Support')}
            </a>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Icon name="Globe" className="h-4 w-4" />
              {lang === 'ru' ? 'EN' : 'RU'}
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}