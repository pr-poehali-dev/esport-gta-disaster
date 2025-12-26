import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface TournamentRegistrationsProps {
  tournamentName?: string;
}

export default function TournamentRegistrations({ tournamentName = 'Winter Championship 2025' }: TournamentRegistrationsProps) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, [tournamentName]);

  const loadRegistrations = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const url = tournamentName 
        ? `https://functions.poehali.dev/5b647bf2-2cba-46c5-8fb5-57bd855a039d?tournament=${encodeURIComponent(tournamentName)}`
        : 'https://functions.poehali.dev/5b647bf2-2cba-46c5-8fb5-57bd855a039d';
      
      const response = await fetch(url, {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.filter((r: any) => r.moderation_status === 'approved'));
      }
    } catch (error) {
      console.log('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-500 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-500 border-red-500/30'
    };

    const labels = {
      pending: 'На рассмотрении',
      approved: 'Одобрено',
      rejected: 'Отклонено'
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || ''}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardContent className="py-12 text-center text-muted-foreground">
          Загрузка...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Trophy" size={24} className="text-secondary" />
            Зарегистрированные команды
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/30">
            {registrations.length} команд
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-4 opacity-30" />
            <p>Пока нет зарегистрированных команд</p>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg, index) => (
              <div
                key={reg.id}
                className="p-4 rounded-lg border border-primary/20 bg-gradient-to-r from-card/50 to-card/30 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-xl font-black">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{reg.logo_url}</div>
                        <div>
                          <div className="text-xl font-black">{reg.team_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Капитан: {reg.captain_nickname}
                          </div>
                        </div>
                      </div>
                      
                      {reg.roster && reg.roster.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {reg.roster.map((player: any, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className={
                                player.player_role === 'main'
                                  ? 'border-primary/30 bg-primary/10 text-primary'
                                  : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-500'
                              }
                            >
                              {player.player_role === 'reserve' && '⚡ '}
                              {player.player_nickname}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(reg.moderation_status)}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(reg.registered_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
