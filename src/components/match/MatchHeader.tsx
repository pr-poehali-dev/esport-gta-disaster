import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Team {
  name: string;
  logo_url: string | null;
  color: string;
}

interface MatchHeaderProps {
  team1: Team;
  team2: Team;
  team1Score: number;
  team2Score: number;
  status: string;
  round: number;
  matchOrder: number;
  referee: {
    id: number;
    nickname: string;
  } | null;
}

export default function MatchHeader({
  team1,
  team2,
  team1Score,
  team2Score,
  status,
  round,
  matchOrder,
  referee
}: MatchHeaderProps) {
  const getStatusBadge = (matchStatus: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      upcoming: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Ожидает' },
      in_progress: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Идет' },
      completed: { bg: 'bg-purple-500/20', text: 'text-purple-500', label: 'Завершен' },
      disputed: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Спор' },
      nullified: { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Аннулирован' }
    };

    const badge = badges[matchStatus] || badges.upcoming;
    return (
      <span className={`px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-sm font-bold`}>
        {badge.label}
      </span>
    );
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            Раунд {round} • Матч {matchOrder}
          </div>
          <h1 className="text-3xl font-black">Матч</h1>
        </div>
        {getStatusBadge(status)}
      </div>

      <div className="grid grid-cols-3 gap-6 items-center">
        <div className="text-center">
          {team1.logo_url ? (
            <img
              src={team1.logo_url}
              alt={team1.name}
              className="w-24 h-24 mx-auto mb-3 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${team1.color}20` }}
            >
              <Icon name="Users" className="h-12 w-12" style={{ color: team1.color }} />
            </div>
          )}
          <h2 className="text-xl font-bold" style={{ color: team1.color }}>
            {team1.name}
          </h2>
        </div>

        <div className="text-center">
          <div className="text-6xl font-black mb-2">
            {team1Score} : {team2Score}
          </div>
          {referee && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Icon name="User" className="h-4 w-4" />
              <span>Судья: {referee.nickname}</span>
            </div>
          )}
        </div>

        <div className="text-center">
          {team2.logo_url ? (
            <img
              src={team2.logo_url}
              alt={team2.name}
              className="w-24 h-24 mx-auto mb-3 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-24 h-24 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${team2.color}20` }}
            >
              <Icon name="Users" className="h-12 w-12" style={{ color: team2.color }} />
            </div>
          )}
          <h2 className="text-xl font-bold" style={{ color: team2.color }}>
            {team2.name}
          </h2>
        </div>
      </div>
    </Card>
  );
}
