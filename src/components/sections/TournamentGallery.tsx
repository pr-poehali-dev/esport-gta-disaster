import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Tournament {
  id: number;
  name: string;
  date: string;
  winner: string;
  prize: string;
  participants: number;
  imageGradient: string;
}

const TournamentGallery = () => {
  const pastTournaments: Tournament[] = [
    {
      id: 1,
      name: 'Зимний Чемпионат 2024',
      date: 'Декабрь 2024',
      winner: 'RAZOR_PRO',
      prize: '100 000₽',
      participants: 256,
      imageGradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      name: 'Осенний Кубок 2024',
      date: 'Октябрь 2024',
      winner: 'CyberKnight',
      prize: '75 000₽',
      participants: 128,
      imageGradient: 'from-orange-500 to-red-500'
    },
    {
      id: 3,
      name: 'Летний Турнир 2024',
      date: 'Июль 2024',
      winner: 'NeonDrift',
      prize: '50 000₽',
      participants: 64,
      imageGradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 4,
      name: 'Весенняя Битва 2024',
      date: 'Апрель 2024',
      winner: 'StreetKing',
      prize: '60 000₽',
      participants: 128,
      imageGradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section className="relative z-10 py-20 bg-gradient-to-b from-transparent via-secondary/5 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black mb-4 text-white">История турниров</h3>
          <p className="text-muted-foreground">Легендарные битвы прошлых сезонов</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {pastTournaments.map((tournament, index) => (
            <Card 
              key={tournament.id} 
              className="border-primary/30 bg-card/80 backdrop-blur hover:scale-105 hover:border-primary/60 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-40 bg-gradient-to-br ${tournament.imageGradient} relative overflow-hidden rounded-t-lg`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="Trophy" size={64} className="text-white/20 group-hover:scale-110 transition-transform" />
                </div>
                <Badge className="absolute top-3 right-3 bg-black/50 border-white/30 backdrop-blur">
                  {tournament.date}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">{tournament.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Award" size={16} className="text-primary" />
                  <span className="text-muted-foreground">Победитель:</span>
                  <span className="font-bold text-primary">{tournament.winner}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="DollarSign" size={16} className="text-secondary" />
                  <span className="text-muted-foreground">Призовой фонд:</span>
                  <span className="font-bold text-secondary">{tournament.prize}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Users" size={16} className="text-accent" />
                  <span className="text-muted-foreground">Участников:</span>
                  <span className="font-bold text-accent">{tournament.participants}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 bg-card/50 backdrop-blur border border-primary/30 rounded-full px-6 py-3">
            <Icon name="Star" className="text-primary" size={20} />
            <span className="text-sm font-bold">
              За всё время проведено <span className="text-primary">30+ турниров</span> с общим призовым фондом <span className="text-secondary">500 000₽+</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TournamentGallery;