import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function SponsorsSection() {
  const headerAnimation = useScrollAnimation();
  const sponsorsAnimation = useScrollAnimation({ threshold: 0.2 });

  const sponsors = [
    { name: 'RAZER', tier: 'Главный спонсор' },
    { name: 'NVIDIA', tier: 'Технологический партнер' },
    { name: 'RED BULL', tier: 'Официальный партнер' },
    { name: 'LOGITECH', tier: 'Технологический партнер' },
    { name: 'ASUS ROG', tier: 'Официальный партнер' },
    { name: 'HYPERX', tier: 'Официальный партнер' },
  ];

  return (
    <section id="sponsors" className="py-32 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={headerAnimation.ref}
          className={`text-center mb-20 transition-all duration-700 ${headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="text-5xl sm:text-6xl font-black mb-4">
            Наши <span className="text-gradient">Партнеры</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Вместе к вершине киберспорта
          </p>
        </div>

        <div 
          ref={sponsorsAnimation.ref}
          className="grid grid-cols-2 md:grid-cols-3 gap-6"
        >
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className={`gradient-border p-8 hover-lift group relative overflow-hidden bg-card transition-all duration-700 ${sponsorsAnimation.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative text-center space-y-4">
                <div className="text-3xl font-black text-gradient group-hover:scale-110 transition-transform duration-300">
                  {sponsor.name}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {sponsor.tier}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}