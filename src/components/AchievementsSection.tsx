import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Icon from '@/components/ui/icon';

interface Achievement {
  title: string;
  tournament: string;
  year: string;
  prize: string;
  icon: string;
}

export default function AchievementsSection() {
  const headerAnimation = useScrollAnimation();
  const achievementsAnimation = useScrollAnimation({ threshold: 0.2 });
  const statsAnimation = useScrollAnimation({ threshold: 0.5 });

  const achievements: Achievement[] = [
    {
      title: '1 МЕСТО',
      tournament: 'ESL Pro League Season 18',
      year: '2024',
      prize: '$175,000',
      icon: 'Trophy',
    },
    {
      title: '2 МЕСТО',
      tournament: 'Blast Premier World Final',
      year: '2024',
      prize: '$100,000',
      icon: 'Award',
    },
    {
      title: '1 МЕСТО',
      tournament: 'IEM Katowice',
      year: '2024',
      prize: '$250,000',
      icon: 'Crown',
    },
    {
      title: '3 МЕСТО',
      tournament: 'PGL Major',
      year: '2023',
      prize: '$70,000',
      icon: 'Medal',
    },
  ];

  return (
    <section id="achievements" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div 
          ref={headerAnimation.ref}
          className={`text-center mb-20 transition-all duration-700 ${headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-5xl sm:text-6xl font-black mb-4">
            Наши <span className="text-gradient">Достижения</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Путь к вершине киберспорта
          </p>
        </div>

        <div 
          ref={achievementsAnimation.ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`group gradient-border p-8 hover-lift relative overflow-hidden transition-all duration-700 ${achievementsAnimation.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 digital-glow">
                  <Icon name={achievement.icon as any} className="h-8 w-8 text-background" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-3xl font-black text-gradient font-mono">
                      {achievement.title}
                    </h3>
                    <span className="text-lg font-bold text-primary whitespace-nowrap font-mono">
                      {achievement.prize}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-lg font-bold text-foreground uppercase tracking-wide">
                      {achievement.tournament}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium font-mono">
                      {achievement.year}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div 
          ref={statsAnimation.ref}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <div className={`text-center space-y-2 group transition-all duration-700 ${statsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '0ms' }}>
            <div className="text-5xl font-black text-gradient font-mono group-hover:scale-110 transition-transform">$850K</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Общий призовой фонд
            </div>
          </div>
          <div className={`text-center space-y-2 group transition-all duration-700 ${statsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '150ms' }}>
            <div className="text-5xl font-black text-gradient font-mono group-hover:scale-110 transition-transform">12</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Турниров выиграно
            </div>
          </div>
          <div className={`text-center space-y-2 group transition-all duration-700 ${statsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
            <div className="text-5xl font-black text-gradient font-mono group-hover:scale-110 transition-transform">94%</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Процент побед
            </div>
          </div>
          <div className={`text-center space-y-2 group transition-all duration-700 ${statsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '450ms' }}>
            <div className="text-5xl font-black text-gradient font-mono group-hover:scale-110 transition-transform">3</div>
            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
              Года на сцене
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}