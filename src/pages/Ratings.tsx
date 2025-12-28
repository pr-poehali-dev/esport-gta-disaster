import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface Team {
  id: number;
  name: string;
  logo_url: string | null;
  color: string;
  rating: number;
  level: number;
  xp: number;
  xp_required: number;
  level_color: string;
  captain_name: string;
  member_count: number;
  recent_matches: string[];
}

const LEVEL_COLORS: Record<number, string> = {
  1: '#FFFFFF',
  2: '#90EE90',
  3: '#00FF00',
  4: '#006400',
  5: '#FFC0CB',
  6: '#FF1493',
  7: '#FFA500',
  8: '#FF6347',
  9: '#FF0000',
  10: '#8B0000'
};

export default function Ratings() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'get_team_ratings' })
      });

      const data = await response.json();

      if (response.ok) {
        setTeams(data.teams || []);
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMatchBadge = (result: string) => {
    if (result === 'W') {
      return (
        <span className="px-2 py-1 rounded bg-green-500/20 text-green-500 font-bold text-xs">
          W
        </span>
      );
    } else if (result === 'L') {
      return (
        <span className="px-2 py-1 rounded bg-red-500/20 text-red-500 font-bold text-xs">
          L
        </span>
      );
    }
    return null;
  };

  const getRankIcon = (position: number) => {
    if (position === 1) return { icon: 'Crown', color: 'text-yellow-500' };
    if (position === 2) return { icon: 'Award', color: 'text-gray-400' };
    if (position === 3) return { icon: 'Medal', color: 'text-orange-600' };
    return { icon: 'TrendingUp', color: 'text-muted-foreground' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Рейтинг команд</h1>
          <p className="text-muted-foreground">Лучшие команды по рейтингу и уровню</p>
        </div>
        <Button onClick={() => navigate('/teams/create')}>
          <Icon name="Users" className="h-4 w-4 mr-2" />
          Создать команду
        </Button>
      </div>

      {teams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {teams.slice(0, 3).map((team, index) => {
            const rank = getRankIcon(index + 1);
            return (
              <Card 
                key={team.id} 
                className="p-6 border-2 hover:shadow-xl transition-all cursor-pointer"
                style={{ borderColor: team.color || '#666' }}
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon name={rank.icon as any} className={`h-8 w-8 ${rank.color}`} />
                  <div className="text-4xl font-black">#{index + 1}</div>
                </div>

                <div className="text-center mb-4">
                  {team.logo_url ? (
                    <img 
                      src={team.logo_url} 
                      alt={team.name} 
                      className="w-20 h-20 mx-auto mb-3 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon name="Users" className="h-10 w-10" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-1">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.captain_name}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Рейтинг</span>
                    <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {team.rating}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Уровень</span>
                    <span 
                      className="text-xl font-black"
                      style={{ color: LEVEL_COLORS[team.level] }}
                    >
                      LVL {team.level}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>XP</span>
                      <span>{team.xp} / {team.xp_required}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ 
                          width: `${(team.xp / team.xp_required) * 100}%`,
                          backgroundColor: LEVEL_COLORS[team.level]
                        }}
                      />
                    </div>
                  </div>

                  {team.recent_matches.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Последние:</span>
                      <div className="flex gap-1">
                        {team.recent_matches.map((result, i) => (
                          <span key={i}>{getMatchBadge(result)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          {teams.slice(3).map((team, index) => {
            const position = index + 4;
            return (
              <div
                key={team.id}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-all cursor-pointer"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <div className="text-2xl font-bold w-12 text-center text-muted-foreground">
                  #{position}
                </div>

                {team.logo_url ? (
                  <img 
                    src={team.logo_url} 
                    alt={team.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="Users" className="h-6 w-6" />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold">{team.name}</h3>
                  <p className="text-sm text-muted-foreground">{team.captain_name} • {team.member_count} игроков</p>
                </div>

                <div className="text-center">
                  <div 
                    className="text-xl font-black"
                    style={{ color: LEVEL_COLORS[team.level] }}
                  >
                    LVL {team.level}
                  </div>
                  <div className="text-xs text-muted-foreground">{team.xp}/{team.xp_required} XP</div>
                </div>

                <div className="text-center min-w-[80px]">
                  <div className="text-2xl font-black">{team.rating}</div>
                  <div className="text-xs text-muted-foreground">рейтинг</div>
                </div>

                {team.recent_matches.length > 0 && (
                  <div className="flex gap-1">
                    {team.recent_matches.map((result, i) => (
                      <span key={i}>{getMatchBadge(result)}</span>
                    ))}
                  </div>
                )}

                <Icon name="ChevronRight" className="h-5 w-5 text-muted-foreground" />
              </div>
            );
          })}
        </div>
      </Card>

      {teams.length === 0 && (
        <div className="text-center py-20">
          <Icon name="Trophy" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">Нет команд в рейтинге</h3>
          <p className="text-muted-foreground mb-4">Создайте команду и начните участвовать в турнирах</p>
          <Button onClick={() => navigate('/teams/create')}>
            <Icon name="Plus" className="h-4 w-4 mr-2" />
            Создать команду
          </Button>
        </div>
      )}
    </div>
  );
}