import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Player {
  id: number;
  name: string;
  rank: number;
  wins: number;
  losses: number;
  winRate: number;
  avatar: string;
}

interface RatingsSectionProps {
  animationRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  mockPlayers: Player[];
}

const RatingsSection = ({ animationRef, isVisible, mockPlayers }: RatingsSectionProps) => {
  return (
    <section id="ratings" className="relative z-10 py-20">
      <div ref={animationRef} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
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
                      className="border-b border-border/50 hover:bg-primary/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
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
                          <span className="text-2xl group-hover:scale-110 transition-transform">{player.avatar}</span>
                          <span className="font-bold text-lg group-hover:text-primary transition-colors">{player.name}</span>
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
  );
};

export default RatingsSection;
