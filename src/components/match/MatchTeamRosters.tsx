import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TeamMember {
  id: number;
  nickname: string;
  avatar_url: string | null;
  role: string;
}

interface Team {
  name: string;
  logo_url: string | null;
  captain_id: number;
  color: string;
  members: TeamMember[];
}

interface MatchTeamRostersProps {
  team1: Team;
  team2: Team;
}

export default function MatchTeamRosters({ team1, team2 }: MatchTeamRostersProps) {
  const renderTeamRoster = (team: Team, side: 'left' | 'right') => {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {team.logo_url ? (
            <img
              src={team.logo_url}
              alt={team.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${team.color}20` }}
            >
              <Icon name="Users" className="h-6 w-6" style={{ color: team.color }} />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold" style={{ color: team.color }}>
              {team.name}
            </h3>
            <p className="text-sm text-muted-foreground">{team.members.length} игроков</p>
          </div>
        </div>

        <div className="space-y-2">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.nickname}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="User" className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                  {member.nickname}
                  {member.id === team.captain_id && (
                    <Icon name="Crown" className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {renderTeamRoster(team1, 'left')}
      {renderTeamRoster(team2, 'right')}
    </div>
  );
}
