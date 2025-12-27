import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Tournament {
  id: number;
  title: string;
  game: string;
  date: string;
  status: 'upcoming' | 'active' | 'completed';
  participants: number;
  prize: string;
}

const mockTournaments: Tournament[] = [
  {
    id: 1,
    title: 'Весенний кубок GTA V',
    game: 'GTA V',
    date: '2025-03-15',
    status: 'upcoming',
    participants: 16,
    prize: '50 000 ₽'
  },
  {
    id: 2,
    title: 'Зимний чемпионат',
    game: 'GTA V',
    date: '2025-01-20',
    status: 'active',
    participants: 32,
    prize: '100 000 ₽'
  },
  {
    id: 3,
    title: 'Осенний турнир',
    game: 'GTA V',
    date: '2024-11-10',
    status: 'completed',
    participants: 24,
    prize: '75 000 ₽'
  }
];

export default function Tournaments() {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      upcoming: { variant: 'secondary', label: 'Скоро' },
      active: { variant: 'default', label: 'Активен' },
      completed: { variant: 'outline', label: 'Завершен' }
    };
    const config = variants[status] || variants.upcoming;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Турниры</h1>
          <p className="text-muted-foreground">
            Актуальные и предстоящие киберспортивные турниры от DISASTER ESPORTS
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockTournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{tournament.title}</CardTitle>
                  {getStatusBadge(tournament.status)}
                </div>
                <Badge variant="outline" className="w-fit">
                  <Icon name="Gamepad2" className="h-3 w-3 mr-1" />
                  {tournament.game}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Icon name="Calendar" className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{new Date(tournament.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Icon name="Users" className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{tournament.participants} участников</span>
                </div>
                <div className="flex items-center text-sm font-semibold text-primary">
                  <Icon name="Trophy" className="h-4 w-4 mr-2" />
                  <span>{tournament.prize}</span>
                </div>
                
                <div className="pt-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/tournaments/${tournament.id}/bracket`)}
                  >
                    <Icon name="GitBranch" className="h-4 w-4 mr-2" />
                    Сетка
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => navigate(`/tournaments/${tournament.id}/teams/create`)}
                  >
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    Команда
                  </Button>
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