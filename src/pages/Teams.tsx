import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  members: number;
  wins: number;
  losses: number;
  winRate: number;
  verified: boolean;
  createdAt: string;
}

export default function Teams() {
  const headerAnimation = useScrollAnimation();
  const [searchQuery, setSearchQuery] = useState('');

  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'PHANTOM SQUAD',
      tag: 'PHNTM',
      logo: '🏆',
      members: 5,
      wins: 48,
      losses: 12,
      winRate: 80,
      verified: true,
      createdAt: '15 ноября 2024',
    },
    {
      id: '2',
      name: 'VORTEX GAMING',
      tag: 'VRTX',
      logo: '⚡',
      members: 5,
      wins: 42,
      losses: 18,
      winRate: 70,
      verified: true,
      createdAt: '20 ноября 2024',
    },
    {
      id: '3',
      name: 'ECLIPSE ESPORTS',
      tag: 'ECLPS',
      logo: '🌙',
      members: 5,
      wins: 38,
      losses: 22,
      winRate: 63,
      verified: true,
      createdAt: '25 ноября 2024',
    },
    {
      id: '4',
      name: 'NEXUS PRO',
      tag: 'NXS',
      logo: '💎',
      members: 5,
      wins: 35,
      losses: 25,
      winRate: 58,
      verified: true,
      createdAt: '01 декабря 2024',
    },
    {
      id: '5',
      name: 'CYBER KNIGHTS',
      tag: 'CYKN',
      logo: '⚔️',
      members: 5,
      wins: 32,
      losses: 28,
      winRate: 53,
      verified: true,
      createdAt: '05 декабря 2024',
    },
    {
      id: '6',
      name: 'STORM RAIDERS',
      tag: 'STRM',
      logo: '🌩️',
      members: 5,
      wins: 28,
      losses: 32,
      winRate: 47,
      verified: true,
      createdAt: '10 декабря 2024',
    },
  ];

  const filteredTeams = mockTeams.filter(
    (team) =>
      team.verified &&
      (team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={headerAnimation.ref}
            className={`text-center mb-12 transition-all duration-700 ${
              headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="text-5xl sm:text-6xl font-black mb-4">
              Зарегистрированные <span className="text-gradient">Команды</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Только подтвержденные команды, готовые к турнирам
            </p>

            <div className="max-w-md mx-auto relative">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Поиск по названию или тегу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, index) => (
              <TeamCard key={team.id} team={team} index={index} />
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-16">
              <Icon name="Users" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Команды не найдены
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  const cardAnimation = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={cardAnimation.ref}
      className={`gradient-border bg-card p-6 hover-lift group relative overflow-hidden transition-all duration-700 ${
        cardAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl digital-glow">
              {team.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-foreground font-mono">
                  {team.name}
                </h3>
                {team.verified && (
                  <Icon name="CheckCircle" className="h-5 w-5 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                [{team.tag}]
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-black text-gradient font-mono">
              {team.wins}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Побед
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-muted-foreground font-mono">
              {team.losses}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Поражений
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-primary font-mono">
              {team.winRate}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Винрейт
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Users" className="h-4 w-4" />
            <span className="font-mono">{team.members} игроков</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {team.createdAt}
          </div>
        </div>
      </div>
    </div>
  );
}
