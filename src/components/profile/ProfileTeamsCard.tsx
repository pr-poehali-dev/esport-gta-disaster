import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';
import { useState } from 'react';

const TEAMS_API = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';

interface ProfileTeamsCardProps {
  teams: any[];
  onTeamUpdate?: () => void;
}

export default function ProfileTeamsCard({ teams, onTeamUpdate }: ProfileTeamsCardProps) {
  const navigate = useNavigate();
  const [leavingTeamId, setLeavingTeamId] = useState<number | null>(null);

  const handleLeaveTeam = async (teamId: number, teamName: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm(`Вы уверены, что хотите покинуть команду "${teamName}"?`)) {
      return;
    }

    const user = localStorage.getItem('user');
    if (!user) return;

    const userData = JSON.parse(user);
    setLeavingTeamId(teamId);

    try {
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userData.id.toString()
        },
        body: JSON.stringify({
          action: 'leave_team',
          team_id: teamId
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успешно', 'Вы покинули команду');
        if (onTeamUpdate) {
          onTeamUpdate();
        }
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', 'Не удалось покинуть команду');
    } finally {
      setLeavingTeamId(null);
    }
  };

  if (!teams || teams.length === 0) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={20} />
            Мои команды
          </CardTitle>
          <CardDescription>У вас пока нет команд</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/teams/create')} className="w-full">
            <Icon name="Plus" size={18} className="mr-2" />
            Создать команду
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={20} />
              Мои команды
            </CardTitle>
            <CardDescription>
              {teams.length > 0 
                ? `Вы состоите в ${teams.length} ${teams.length === 1 ? 'команде' : 'командах'}`
                : 'Команды, в которых вы состоите'}
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/teams/create')} size="sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Создать
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-background hover:border-primary/50 transition-all group"
          >
            <div 
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={() => navigate(`/teams/${team.id}`)}
            >
              {team.logo_url ? (
                <img
                  src={team.logo_url}
                  alt={team.name}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                  <Icon name="Shield" size={24} className="text-primary" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold group-hover:text-primary transition-colors">{team.name}</p>
                  {team.is_captain && (
                    <Badge variant="default" className="text-xs">
                      <Icon name="Crown" size={12} className="mr-1" />
                      Капитан
                    </Badge>
                  )}
                </div>
                {team.tag && (
                  <p className="text-xs text-muted-foreground">[{team.tag}]</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Star" size={12} />
                    {team.rating}
                  </span>
                  <span>•</span>
                  <span>{team.wins}W / {team.losses}L</span>
                  <span>•</span>
                  <Badge variant={team.player_role === 'main' ? 'default' : 'outline'} className="text-xs h-5">
                    {team.player_role === 'main' ? 'Основной' : 'Запасной'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleLeaveTeam(team.id, team.name, e)}
                disabled={leavingTeamId === team.id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Icon name="LogOut" size={16} className="mr-1" />
                Выйти
              </Button>
              <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/teams/${team.id}`)} />
            </div>
          </div>
        ))}
        
        {teams.length > 0 && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/teams');
            }} 
            variant="ghost" 
            className="w-full mt-2"
          >
            Смотреть все команды
            <Icon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}