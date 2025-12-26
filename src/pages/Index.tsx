import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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
    console.log('Registration:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEzLDE0OCwyMzEsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <header className="relative z-10 border-b border-primary/20 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-primary via-secondary to-accent rounded clip-corner flex items-center justify-center">
                <Icon name="Zap" className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight neon-glow">DISASTER E2SPORT</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">ГТА Криминальная Россия</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#tournaments" className="text-sm font-medium hover:text-primary transition-colors">Турниры</a>
              <a href="#register" className="text-sm font-medium hover:text-primary transition-colors">Регистрация</a>
              <a href="#ratings" className="text-sm font-medium hover:text-primary transition-colors">Рейтинг</a>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative z-10 py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
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
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold px-8 py-6 text-lg clip-corner">
                <Icon name="Trophy" className="mr-2" size={20} />
                Зарегистрироваться
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 font-bold px-8 py-6 text-lg clip-corner">
                <Icon name="Play" className="mr-2" size={20} />
                Смотреть стрим
              </Button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] -z-10"></div>
      </section>

      <section id="register" className="relative z-10 py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black mb-4 text-white">Регистрация на турнир</h3>
              <p className="text-muted-foreground">Заполни форму и стань частью легенды</p>
            </div>
            
            <Card className="border-primary/30 bg-card/80 backdrop-blur neon-border">
              <CardHeader>
                <CardTitle className="text-2xl">Форма участника</CardTitle>
                <CardDescription>Убедись, что данные указаны корректно</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Игровой никнейм</label>
                    <Input 
                      placeholder="RAZOR_PRO"
                      value={formData.nickname}
                      onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                      className="bg-background/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Discord</label>
                    <Input 
                      placeholder="username#1234"
                      value={formData.discord}
                      onChange={(e) => setFormData({...formData, discord: e.target.value})}
                      className="bg-background/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Команда (опционально)</label>
                    <Input 
                      placeholder="Team Disaster"
                      value={formData.team}
                      onChange={(e) => setFormData({...formData, team: e.target.value})}
                      className="bg-background/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
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

      <section id="tournaments" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black mb-4 text-white">Турнирная сетка</h3>
            <p className="text-muted-foreground">Следи за ходом соревнований в реальном времени</p>
          </div>

          <Tabs defaultValue="bracket" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="bracket" className="font-bold">
                <Icon name="GitBranch" className="mr-2" size={18} />
                Сетка
              </TabsTrigger>
              <TabsTrigger value="matches" className="font-bold">
                <Icon name="Swords" className="mr-2" size={18} />
                Матчи
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bracket" className="space-y-6">
              <div className="grid gap-4">
                {mockMatches.map((match) => (
                  <Card key={match.id} className="border-primary/30 bg-card/80 backdrop-blur hover:border-primary/60 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Badge className="mb-2 bg-secondary/20 text-secondary border-secondary/50">
                            {match.round}
                          </Badge>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded clip-corner flex items-center justify-center font-bold">
                                {match.player1[0]}
                              </div>
                              <span className="font-bold text-lg">{match.player1}</span>
                            </div>
                            {match.score1 !== undefined && (
                              <span className="text-2xl font-black text-primary">{match.score1}</span>
                            )}
                          </div>
                          <div className="my-3 flex items-center gap-2">
                            <div className="flex-1 h-px bg-border"></div>
                            <span className="text-xs text-muted-foreground uppercase px-2">VS</span>
                            <div className="flex-1 h-px bg-border"></div>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded clip-corner flex items-center justify-center font-bold">
                                {match.player2[0]}
                              </div>
                              <span className="font-bold text-lg">{match.player2}</span>
                            </div>
                            {match.score2 !== undefined && (
                              <span className="text-2xl font-black text-accent">{match.score2}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          {match.status === 'live' && (
                            <Badge className="bg-red-500 text-white border-0 animate-pulse">
                              <Icon name="Radio" className="mr-1" size={14} />
                              LIVE
                            </Badge>
                          )}
                          {match.status === 'upcoming' && (
                            <Badge variant="outline" className="border-muted-foreground/50">
                              <Icon name="Clock" className="mr-1" size={14} />
                              Скоро
                            </Badge>
                          )}
                          {match.status === 'completed' && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              <Icon name="CheckCircle" className="mr-1" size={14} />
                              Завершен
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="matches" className="text-center text-muted-foreground py-12">
              <Icon name="Calendar" className="mx-auto mb-4 text-primary" size={48} />
              <p className="text-lg">Расписание матчей появится после завершения регистрации</p>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section id="ratings" className="relative z-10 py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black mb-4 text-white">Таблица рейтингов</h3>
            <p className="text-muted-foreground">Лучшие игроки текущего сезона</p>
          </div>

          <Card className="max-w-6xl mx-auto border-primary/30 bg-card/80 backdrop-blur neon-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/30 bg-primary/5">
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Место</th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Игрок</th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Побед</th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Поражений</th>
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Винрейт</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPlayers.map((player, index) => (
                      <tr 
                        key={player.id} 
                        className="border-b border-border/50 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {index < 3 ? (
                              <div className={`w-8 h-8 rounded clip-corner flex items-center justify-center font-black ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                'bg-gradient-to-br from-orange-600 to-orange-700'
                              }`}>
                                {player.rank}
                              </div>
                            ) : (
                              <span className="w-8 text-center font-bold text-muted-foreground">{player.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{player.avatar}</span>
                            <span className="font-bold text-lg">{player.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-green-400">{player.wins}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-red-400">{player.losses}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={`font-bold ${
                            player.winRate >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            player.winRate >= 70 ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/50'
                          }`}>
                            {player.winRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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
              <h4 className="font-bold text-lg mb-4 text-white">Ссылки</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Правила турниров</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Контакты</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-white">Социальные сети</h4>
              <div className="flex gap-3">
                <Button size="icon" variant="outline" className="border-primary/30 hover:bg-primary/10">
                  <Icon name="MessageCircle" size={20} />
                </Button>
                <Button size="icon" variant="outline" className="border-primary/30 hover:bg-primary/10">
                  <Icon name="Youtube" size={20} />
                </Button>
                <Button size="icon" variant="outline" className="border-primary/30 hover:bg-primary/10">
                  <Icon name="Twitch" size={20} />
                </Button>
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border/50">
            © 2025 DISASTER E2SPORT. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
