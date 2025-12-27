import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface Match {
  date: string;
  time: string;
  tournament: string;
  opponent: string;
  game: string;
  status: 'upcoming' | 'live' | 'finished';
  result?: string;
}

export default function MatchesSection() {
  const matches: Match[] = [
    {
      date: '28 ДЕК',
      time: '19:00',
      tournament: 'ESL Pro League',
      opponent: 'TEAM LIQUID',
      game: 'CS2',
      status: 'upcoming',
    },
    {
      date: '27 ДЕК',
      time: 'СЕЙЧАС',
      tournament: 'Blast Premier',
      opponent: 'NAVI',
      game: 'CS2',
      status: 'live',
      result: '1:0',
    },
    {
      date: '26 ДЕК',
      time: '21:00',
      tournament: 'IEM Katowice',
      opponent: 'FAZE CLAN',
      game: 'CS2',
      status: 'finished',
      result: '2:1',
    },
  ];

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'live':
        return 'text-primary';
      case 'finished':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  const getStatusBadge = (status: Match['status']) => {
    switch (status) {
      case 'live':
        return (
          <span className="px-3 py-1 bg-primary/20 border border-primary text-primary text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            LIVE
          </span>
        );
      case 'finished':
        return (
          <span className="px-3 py-1 bg-muted border border-border text-muted-foreground text-xs font-bold">
            ЗАВЕРШЕН
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-card border border-primary/30 text-primary text-xs font-bold">
            СКОРО
          </span>
        );
    }
  };

  return (
    <section id="matches" className="py-32 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-black mb-4">
            Ближайшие <span className="text-gradient">Матчи</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Следите за нашими выступлениями в реальном времени
          </p>
        </div>

        <div className="space-y-4">
          {matches.map((match, index) => (
            <div
              key={index}
              className={`gradient-border p-6 hover-lift ${
                match.status === 'live' ? 'scanline' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="text-center min-w-[80px]">
                    <div className={`text-2xl font-black ${getStatusColor(match.status)}`}>
                      {match.date}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {match.time}
                    </div>
                  </div>

                  <div className="h-12 w-px bg-border" />

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 bg-secondary/20 border border-secondary/30 text-secondary font-semibold">
                        {match.game}
                      </span>
                      {getStatusBadge(match.status)}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {match.tournament}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-center">
                    <div>
                      <div className="text-xl font-black text-gradient mb-1">DISASTER</div>
                      {match.result && (
                        <div className="text-sm text-primary font-bold">
                          {match.result.split(':')[0]}
                        </div>
                      )}
                    </div>

                    <div className="text-2xl font-black text-muted-foreground">VS</div>

                    <div>
                      <div className="text-xl font-black mb-1">{match.opponent}</div>
                      {match.result && (
                        <div className="text-sm text-muted-foreground font-bold">
                          {match.result.split(':')[1]}
                        </div>
                      )}
                    </div>
                  </div>

                  {match.status === 'live' && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-secondary text-background font-bold digital-glow"
                    >
                      <Icon name="Eye" className="mr-2 h-4 w-4" />
                      Смотреть
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 font-bold">
            Все матчи
            <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
