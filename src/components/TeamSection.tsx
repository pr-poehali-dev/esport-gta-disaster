import Icon from '@/components/ui/icon';

interface TeamMember {
  nickname: string;
  role: string;
  games: string[];
  stats: { label: string; value: string }[];
}

export default function TeamSection() {
  const team: TeamMember[] = [
    {
      nickname: 'PHANTOM',
      role: 'Капитан',
      games: ['CS2', 'Valorant'],
      stats: [
        { label: 'K/D', value: '2.4' },
        { label: 'Рейтинг', value: '2850' },
        { label: 'Матчей', value: '320' },
      ],
    },
    {
      nickname: 'VORTEX',
      role: 'Снайпер',
      games: ['CS2'],
      stats: [
        { label: 'K/D', value: '2.1' },
        { label: 'Рейтинг', value: '2720' },
        { label: 'Матчей', value: '285' },
      ],
    },
    {
      nickname: 'ECLIPSE',
      role: 'Поддержка',
      games: ['Dota 2', 'LoL'],
      stats: [
        { label: 'Винрейт', value: '68%' },
        { label: 'MMR', value: '7200' },
        { label: 'Матчей', value: '412' },
      ],
    },
    {
      nickname: 'NEXUS',
      role: 'Стратег',
      games: ['Valorant', 'CS2'],
      stats: [
        { label: 'K/D', value: '1.9' },
        { label: 'Рейтинг', value: '2680' },
        { label: 'Матчей', value: '298' },
      ],
    },
  ];

  return (
    <section id="team" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-black mb-4">
            Наша <span className="text-gradient">Команда</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Профессионалы, которые превращают хаос в победу
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, index) => (
            <div
              key={member.nickname}
              className="group gradient-border hover-lift bg-card p-6 relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
              
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-gradient mb-1">
                      {member.nickname}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      {member.role}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center digital-glow">
                    <Icon name="Zap" className="h-5 w-5 text-background" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {member.games.map((game) => (
                    <span
                      key={game}
                      className="text-xs px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-semibold"
                    >
                      {game}
                    </span>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  {member.stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className="text-sm font-bold text-primary">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
