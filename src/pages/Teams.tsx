import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { api, Team } from '@/services/api';
import TeamLevelBadge from '@/components/TeamLevelBadge';

interface Player {
  id: number;
  nickname: string;
  avatar_url: string | null;
  rating: number;
  wins: number;
  losses: number;
  mvp_count: number;
}

const mockPlayers: Player[] = [
  {id: 1, nickname: 'ProPlayer123', avatar_url: null, rating: 1720, wins: 45, losses: 18, mvp_count: 12},
  {id: 2, nickname: 'CyberNinja', avatar_url: null, rating: 1680, wins: 42, losses: 20, mvp_count: 10},
  {id: 3, nickname: 'GamerPro', avatar_url: null, rating: 1620, wins: 38, losses: 22, mvp_count: 8}
];

export default function Teams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [players] = useState<Player[]>(mockPlayers);

  useEffect(() => {
    api.getTeams()
      .then(setTeams)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 1700) return 'text-yellow-500';
    if (rating >= 1500) return 'text-purple-500';
    if (rating >= 1300) return 'text-blue-500';
    if (rating >= 1100) return 'text-green-500';
    return 'text-gray-500';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 1700) return { label: 'Легенда', variant: 'default' as const };
    if (rating >= 1500) return { label: 'Мастер', variant: 'secondary' as const };
    if (rating >= 1300) return { label: 'Эксперт', variant: 'outline' as const };
    if (rating >= 1100) return { label: 'Продвинутый', variant: 'outline' as const };
    return { label: 'Новичок', variant: 'outline' as const };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Команды</h1>
              <p className="text-sm text-muted-foreground">Зарегистрированные команды и рейтинги игроков</p>
            </div>
            <Button onClick={() => navigate('/teams/create')}>
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Создать команду
            </Button>
          </div>

          <Tabs defaultValue="teams" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="teams"><Icon name="Users" className="h-4 w-4 mr-2" />Команды</TabsTrigger>
              <TabsTrigger value="players"><Icon name="User" className="h-4 w-4 mr-2" />Игроки</TabsTrigger>
            </TabsList>

            <TabsContent value="teams" className="space-y-4">
              {loading ? (
                <div className="text-center py-12">Загрузка команд...</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Команды не найдены</div>
              ) : (
                teams.map((team, index) => (
                  <Card key={team.id} className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/teams/${team.id}`)}>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="w-12 text-center text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          {team.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-lg" /> : <Icon name="Shield" className="h-8 w-8 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <TeamLevelBadge level={team.level || 2} size="md" />
                            <h3 className="text-xl font-semibold">{team.name}</h3>
                            <Badge variant={getRatingBadge(team.rating).variant}>{getRatingBadge(team.rating).label}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Icon name="Users" className="h-4 w-4" /><span>{team.member_count || 0} участников</span></div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">{team.wins}П</span>
                              <span className="text-red-500">{team.losses}П</span>
                              <span className="text-gray-500">{team.draws || 0}Н</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right min-w-[70px]">
                          <div className="text-xs text-muted-foreground mb-1">Очки</div>
                          <div className="text-lg font-bold text-primary">{team.points || 200}</div>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className="text-xs text-muted-foreground mb-1">Рейтинг</div>
                          <div className={`text-2xl font-bold ${getRatingColor(team.rating)}`}>{team.rating}</div>
                        </div>
                        <Button variant="ghost" size="sm"><Icon name="ChevronRight" className="h-5 w-5" /></Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="players" className="space-y-4">
              {players.map((player, index) => (
                <Card key={player.id} className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/user/${player.id}`)}>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="w-12 text-center text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {player.avatar_url ? <img src={player.avatar_url} alt={player.nickname} className="w-full h-full object-cover rounded-full" /> : <Icon name="User" className="h-8 w-8 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{player.nickname}</h3>
                          <Badge variant={getRatingBadge(player.rating).variant}>{getRatingBadge(player.rating).label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">{player.wins}П</span>
                            <span className="text-red-500">{player.losses}П</span>
                          </div>
                          <div className="flex items-center gap-1"><Icon name="Award" className="h-4 w-4 text-yellow-500" /><span>{player.mvp_count} MVP</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right min-w-[80px]">
                        <div className="text-xs text-muted-foreground mb-1">Рейтинг</div>
                        <div className={`text-2xl font-bold ${getRatingColor(player.rating)}`}>{player.rating}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/profile/${player.id}`)}><Icon name="ChevronRight" className="h-5 w-5" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}