import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Match {
  id: number;
  player1: string;
  player2: string;
  score1?: number;
  score2?: number;
  status: 'upcoming' | 'live' | 'completed';
  round: string;
}

interface TournamentSectionProps {
  animationRef: React.RefObject<HTMLDivElement>;
  isVisible: boolean;
  mockMatches: Match[];
}

const TournamentSection = ({ animationRef, isVisible, mockMatches }: TournamentSectionProps) => {
  return (
    <section id="tournaments" className="relative z-10 py-20">
      <div ref={animationRef} className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
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
                <Card key={match.id} className="border-primary/30 bg-card/80 backdrop-blur hover:border-primary hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Badge className="mb-2 bg-secondary/20 text-secondary border-secondary/50">
                          {match.round}
                        </Badge>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded clip-corner flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                              {match.player1[0]}
                            </div>
                            <span className="font-bold text-lg group-hover:text-primary transition-colors">{match.player1}</span>
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
                            <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded clip-corner flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                              {match.player2[0]}
                            </div>
                            <span className="font-bold text-lg group-hover:text-accent transition-colors">{match.player2}</span>
                          </div>
                          {match.score2 !== undefined && (
                            <span className="text-2xl font-black text-accent">{match.score2}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        {match.status === 'live' && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                            <Icon name="Radio" className="mr-1" size={12} />
                            LIVE
                          </Badge>
                        )}
                        {match.status === 'completed' && (
                          <Badge variant="outline" className="border-muted-foreground/30">
                            Завершен
                          </Badge>
                        )}
                        {match.status === 'upcoming' && (
                          <Badge variant="outline" className="border-primary/30">
                            Скоро
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matches" className="text-center py-12">
            <Icon name="Trophy" size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground">Полная информация о матчах появится после начала турнира</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default TournamentSection;
