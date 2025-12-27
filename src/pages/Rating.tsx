import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Player {
  id: number;
  rank: number;
  nickname: string;
  team: string;
  points: number;
  wins: number;
  losses: number;
  avatar?: string;
}

const mockPlayers: Player[] = [
  { id: 1, rank: 1, nickname: 'ProPlayer', team: 'Team Alpha', points: 2500, wins: 45, losses: 5 },
  { id: 2, rank: 2, nickname: 'GamerX', team: 'Team Beta', points: 2300, wins: 40, losses: 8 },
  { id: 3, rank: 3, nickname: 'Destroyer', team: 'Team Gamma', points: 2100, wins: 38, losses: 10 },
  { id: 4, rank: 4, nickname: 'Shadow', team: 'Team Delta', points: 2000, wins: 35, losses: 12 },
  { id: 5, rank: 5, nickname: 'Phoenix', team: 'Team Epsilon', points: 1900, wins: 32, losses: 15 }
];

export default function Rating() {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Icon name="Crown" className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Icon name="Medal" className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Icon name="Award" className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-semibold">#{rank}</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Рейтинг игроков</h1>
          <p className="text-muted-foreground">
            Топ игроков DISASTER ESPORTS по набранным очкам
          </p>
        </div>

        <div className="space-y-3">
          {mockPlayers.map((player) => (
            <Card key={player.id} className={`hover:border-primary transition-colors ${player.rank <= 3 ? 'border-primary/50' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(player.rank)}
                    </div>
                    
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.nickname} className="w-12 h-12 rounded-full" />
                      ) : (
                        <Icon name="User" className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-lg">{player.nickname}</div>
                      <div className="text-sm text-muted-foreground">{player.team}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{player.points}</div>
                      <div className="text-xs text-muted-foreground">очков</div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Badge variant="default" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
                        <Icon name="TrendingUp" className="h-3 w-3 mr-1" />
                        {player.wins}
                      </Badge>
                      <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
                        <Icon name="TrendingDown" className="h-3 w-3 mr-1" />
                        {player.losses}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
