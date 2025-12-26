import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { playHoverSound, playSuccessSound } from '@/utils/sounds';
import Header from '@/components/sections/Header';
import TournamentSection from '@/components/sections/TournamentSection';
import RatingsSection from '@/components/sections/RatingsSection';
import RulesSection from '@/components/sections/RulesSection';
import TournamentGallery from '@/components/sections/TournamentGallery';
import LiveCounter from '@/components/LiveCounter';

interface Player {
  id: number;
  name: string;
  rank: number;
  wins: number;
  losses: number;
  winRate: number;
  avatar: string;
}

interface Match {
  id: number;
  player1: string;
  player2: string;
  score1?: number;
  score2?: number;
  status: 'upcoming' | 'live' | 'completed';
  round: string;
}

const Index = () => {
  const [formData, setFormData] = useState({
    nickname: '',
    discord: '',
    team: ''
  });
  const { toast } = useToast();

  const heroAnimation = useScrollAnimation();
  const registerAnimation = useScrollAnimation();
  const tournamentAnimation = useScrollAnimation();
  const ratingsAnimation = useScrollAnimation();

  const mockPlayers: Player[] = [
    { id: 1, name: 'RAZOR_PRO', rank: 1, wins: 24, losses: 3, winRate: 88.9, avatar: '🏆' },
    { id: 2, name: 'CyberKnight', rank: 2, wins: 22, losses: 5, winRate: 81.5, avatar: '⚡' },
    { id: 3, name: 'NeonDrift', rank: 3, wins: 19, losses: 6, winRate: 76.0, avatar: '🔥' },
    { id: 4, name: 'StreetKing', rank: 4, wins: 18, losses: 8, winRate: 69.2, avatar: '👑' },
    { id: 5, name: 'TurboX', rank: 5, wins: 16, losses: 9, winRate: 64.0, avatar: '💨' },
  ];

  const mockMatches: Match[] = [
    { id: 1, player1: 'RAZOR_PRO', player2: 'CyberKnight', score1: 3, score2: 1, status: 'completed', round: 'Финал' },
    { id: 2, player1: 'NeonDrift', player2: 'StreetKing', score1: 2, score2: 1, status: 'completed', round: 'Полуфинал' },
    { id: 3, player1: 'TurboX', player2: 'RAZOR_PRO', status: 'live', round: '1/4 Финала' },
    { id: 4, player1: 'DarkRider', player2: 'SpeedDemon', status: 'upcoming', round: '1/8 Финала' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nickname || !formData.discord) {
      toast({
        title: "Ошибка регистрации",
        description: "Заполните обязательные поля: никнейм и Discord",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Registration:', formData);
    
    playSuccessSound();
    
    toast({
      title: "✅ Регистрация успешна!",
      description: `Добро пожаловать в турнир, ${formData.nickname}! Проверьте Discord для подтверждения.`,
      className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
    });
    
    setFormData({ nickname: '', discord: '', team: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEzLDE0OCwyMzEsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <Header />

      <section className="relative z-10 py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div ref={heroAnimation.ref} className={`max-w-4xl mx-auto text-center transition-all duration-700 ${heroAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <Badge className="mb-6 bg-gradient-to-r from-primary to-secondary text-white border-0 px-6 py-2 text-sm font-bold">
              СЕЗОН 2025
            </Badge>
            <h2 className="text-6xl md:text-8xl font-black mb-6 glitch">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                КИБЕРСПОРТ
              </span>
              <br />
              <span className="text-white">НОВОГО УРОВНЯ</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Присоединяйся к крупнейшему турниру по ГТА Криминальная Россия. Докажи, что ты лучший на улицах виртуального мира.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold clip-corner px-8">
                <Icon name="Trophy" className="mr-2" size={20} />
                Призовой фонд: 90 000₽
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 font-bold">
                <Icon name="Users" className="mr-2" size={20} />
                128+ участников
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <LiveCounter targetCount={128} label="Участников" icon="Users" color="primary" />
            <LiveCounter targetCount={90} label="Тысяч призовых" icon="Trophy" color="secondary" />
            <LiveCounter targetCount={12} label="Проведено турниров" icon="Calendar" color="accent" />
          </div>
        </div>
      </section>

      <TournamentGallery />

      <section id="register" className="relative z-10 py-20 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div ref={registerAnimation.ref} className={`max-w-2xl mx-auto transition-all duration-700 ${registerAnimation.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="text-center mb-8">
              <h3 className="text-4xl font-black mb-4 text-white">Регистрация на турнир</h3>
              <p className="text-muted-foreground">Заполни форму и стань частью легенды</p>
            </div>
            
            <Card className="border-primary/30 bg-card/80 backdrop-blur neon-border">
              <CardHeader>
                <CardTitle className="text-2xl">Форма участника</CardTitle>
                <CardDescription>Все поля обязательны для заполнения</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2">
                      <Icon name="User" size={16} />
                      Игровой никнейм *
                    </label>
                    <Input 
                      placeholder="RAZOR_PRO"
                      value={formData.nickname}
                      onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                      className="bg-background/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2">
                      <Icon name="MessageSquare" size={16} />
                      Discord *
                    </label>
                    <Input 
                      placeholder="username#1234"
                      value={formData.discord}
                      onChange={(e) => setFormData({...formData, discord: e.target.value})}
                      className="bg-background/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-bold mb-2 block flex items-center gap-2">
                      <Icon name="Users" size={16} />
                      Команда (опционально)
                    </label>
                    <Input 
                      placeholder="Team Disaster"
                      value={formData.team}
                      onChange={(e) => setFormData({...formData, team: e.target.value})}
                      className="bg-background/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    onMouseEnter={playHoverSound}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-6 clip-corner"
                  >
                    <Icon name="Check" className="mr-2" size={20} />
                    Подтвердить участие
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <TournamentSection 
        animationRef={tournamentAnimation.ref}
        isVisible={tournamentAnimation.isVisible}
        mockMatches={mockMatches}
      />

      <RatingsSection 
        animationRef={ratingsAnimation.ref}
        isVisible={ratingsAnimation.isVisible}
        mockPlayers={mockPlayers}
      />

      <RulesSection />

      <footer className="relative z-10 border-t border-primary/20 bg-background/50 backdrop-blur-xl py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">DISASTER E2SPORT</h4>
              <p className="text-sm text-muted-foreground">
                Киберспортивная организация, проводящая профессиональные турниры по ГТА Криминальная Россия.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Быстрые ссылки</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#tournaments" className="hover:text-primary transition-colors">Турниры</a></li>
                <li><a href="#register" className="hover:text-primary transition-colors">Регистрация</a></li>
                <li><a href="#ratings" className="hover:text-primary transition-colors">Рейтинг</a></li>
                <li><a href="#rules" className="hover:text-primary transition-colors">Правила</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Связь</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Icon name="MessageSquare" size={16} />
                  Discord: disaster#1234
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  info@disaster.gg
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary/20 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 DISASTER ESPORTS. Все права защищены.</p>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
};

export default Index;