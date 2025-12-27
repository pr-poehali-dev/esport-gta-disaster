import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: number;
  nickname: string;
  avatar_url: string | null;
  role: string;
  rating: number;
  is_reserve: boolean;
}

interface Match {
  id: number;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  date: string;
  tournament: string;
}

export default function TeamProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const team = {
    id: 1,
    name: 'Team Alpha',
    logo_url: null,
    rating: 1650,
    wins: 25,
    losses: 10,
    draws: 3,
    website: 'https://teamalpha.com',
    created_at: '2024-01-15'
  };

  const members: TeamMember[] = [
    { id: 1, nickname: 'Player1', avatar_url: null, role: 'Капитан', rating: 1720, is_reserve: false },
    { id: 2, nickname: 'Player2', avatar_url: null, role: 'Игрок', rating: 1680, is_reserve: false },
    { id: 3, nickname: 'Player3', avatar_url: null, role: 'Игрок', rating: 1620, is_reserve: false },
    { id: 4, nickname: 'Player4', avatar_url: null, role: 'Запасной', rating: 1500, is_reserve: true }
  ];

  const matches: Match[] = [
    { id: 1, opponent: 'Team Beta', result: 'win', score: '16-12', date: '2025-01-10', tournament: 'Зимний чемпионат' },
    { id: 2, opponent: 'Pro Gamers', result: 'loss', score: '10-16', date: '2025-01-08', tournament: 'Зимний чемпионат' },
    { id: 3, opponent: 'Cyber Warriors', result: 'win', score: '16-14', date: '2025-01-05', tournament: 'Зимний чемпионат' }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 1700) return 'text-yellow-500';
    if (rating >= 1500) return 'text-purple-500';
    if (rating >= 1300) return 'text-blue-500';
    return 'text-green-500';
  };

  const winRate = Math.round((team.wins / (team.wins + team.losses + team.draws)) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate('/teams')} className="mb-6">
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Назад к командам
          </Button>

          <Card className="p-8 mb-6">
            <div className="flex items-start gap-8">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Icon name="Shield" className="h-16 w-16 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-5xl font-black mb-4">{team.name}</h1>
                
                <div className="grid grid-cols-4 gap-6 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Рейтинг</div>
                    <div className={`text-3xl font-black ${getRatingColor(team.rating)}`}>{team.rating}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Побед</div>
                    <div className="text-3xl font-black text-green-500">{team.wins}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Поражений</div>
                    <div className="text-3xl font-black text-red-500">{team.losses}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Винрейт</div>
                    <div className="text-3xl font-black text-primary">{winRate}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {team.website && (
                    <a href={team.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <Icon name="Globe" className="h-4 w-4" />
                      <span>Сайт команды</span>
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <Icon name="Calendar" className="h-4 w-4" />
                    <span>Создана {new Date(team.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="members">
                <Icon name="Users" className="h-4 w-4 mr-2" />
                Состав
              </TabsTrigger>
              <TabsTrigger value="matches">
                <Icon name="Trophy" className="h-4 w-4 mr-2" />
                Матчи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <div className="grid gap-4">
                {members.map((member) => (
                  <Card key={member.id} className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/user/${member.id}`)}>
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.nickname} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <Icon name="User" className="h-8 w-8 text-primary" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{member.nickname}</h3>
                          <Badge variant={member.is_reserve ? 'outline' : 'default'}>{member.role}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Рейтинг: <span className={`font-bold ${getRatingColor(member.rating)}`}>{member.rating}</span>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        <Icon name="ChevronRight" className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              <div className="grid gap-4">
                {matches.map((match) => (
                  <Card key={match.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="text-center">
                          <Badge variant={match.result === 'win' ? 'default' : match.result === 'loss' ? 'destructive' : 'secondary'}>
                            {match.result === 'win' ? 'Победа' : match.result === 'loss' ? 'Поражение' : 'Ничья'}
                          </Badge>
                        </div>

                        <div className="flex-1">
                          <div className="text-lg font-bold mb-1">vs {match.opponent}</div>
                          <div className="text-sm text-muted-foreground">{match.tournament}</div>
                        </div>

                        <div className="text-3xl font-black">{match.score}</div>
                        
                        <div className="text-sm text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
