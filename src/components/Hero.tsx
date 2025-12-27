import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function Hero() {
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="absolute inset-0 scanline opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="space-y-8">
          <div 
            className={`inline-block pixel-corners bg-primary/10 border border-primary/30 px-6 py-2 transition-all duration-700 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="text-sm font-bold tracking-[0.2em] text-primary uppercase font-mono">
              Киберспортивная организация
            </span>
          </div>

          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter">
            <span 
              className={`block neon-text relative transition-all duration-1000 delay-200 ${textVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
              data-text="DISASTER"
            >
              DISASTER
            </span>
            <span 
              className={`block text-foreground mt-2 font-mono tracking-[0.1em] transition-all duration-1000 delay-400 ${textVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            >
              ESPORTS
            </span>
          </h1>

          <p 
            className={`text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium transition-all duration-700 delay-600 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Мы не просто играем — мы доминируем. Сила, точность и стратегия в каждом матче.
          </p>

          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 transition-all duration-700 delay-700 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary text-background font-bold text-lg px-8 hover-lift"
            >
              <Icon name="Users" className="mr-2 h-5 w-5" />
              Наша команда
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 font-bold text-lg px-8"
            >
              <Icon name="Calendar" className="mr-2 h-5 w-5" />
              Расписание матчей
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
            <div className="space-y-2 group">
              <div className="text-4xl sm:text-5xl font-black text-gradient font-mono group-hover:scale-110 transition-transform">
                50+
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Побед
              </div>
            </div>
            <div className="space-y-2 group">
              <div className="text-4xl sm:text-5xl font-black text-gradient font-mono group-hover:scale-110 transition-transform">
                12
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Турниров
              </div>
            </div>
            <div className="space-y-2 group">
              <div className="text-4xl sm:text-5xl font-black text-gradient font-mono group-hover:scale-110 transition-transform">
                #1
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Рейтинг
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <Icon name="ChevronDown" className="h-8 w-8 text-primary" />
      </div>
    </section>
  );
}