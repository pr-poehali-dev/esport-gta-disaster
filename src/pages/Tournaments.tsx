import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { api, Tournament } from '@/services/api';



export default function Tournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTournaments()
      .then(setTournaments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (registrationOpen: boolean) => {
    const label = registrationOpen ? 'Регистрация открыта' : 'Регистрация закрыта';
    const variant = registrationOpen ? 'default' : 'outline';
    return <Badge variant={variant}>{label};</Badge>;
  };

  const getOldStatusBadge = (status: string) => {
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

        {loading ? (
          <div className="text-center py-12">Загрузка турниров...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{tournament.name}</CardTitle>
                    {getStatusBadge(tournament.registrationOpen)}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    <Icon name="Gamepad2" className="h-3 w-3 mr-1" />
                    {tournament.gameType}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{tournament.description}</p>
                  <div className="flex items-center text-sm">
                    <Icon name="Calendar" className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{new Date(tournament.startDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Icon name="Users" className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{tournament.registeredTeams} / {tournament.maxTeams} команд</span>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-primary">
                    <Icon name="Trophy" className="h-4 w-4 mr-2" />
                    <span>{tournament.prizePool}</span>
                  </div>
                
                <div className="pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/tournaments/${tournament.id}/bracket`)}
                  >
                    <Icon name="GitBranch" className="h-4 w-4 mr-2" />
                    Турнирная сетка
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}