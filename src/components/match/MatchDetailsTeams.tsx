import Icon from '@/components/ui/icon';

interface Player {
  id: number;
  nickname: string;
  avatar_url: string | null;
  role: string;
  status: 'online' | 'offline' | 'away';
}

interface Team {
  id: number;
  name: string;
  logo_url: string | null;
  captain_id: number;
  members: Player[];
}

interface Match {
  team1: Team;
  team2: Team;
}

interface MatchDetailsTeamsProps {
  match: Match;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return 'bg-green-500';
    case 'away': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export default function MatchDetailsTeams({ match }: MatchDetailsTeamsProps) {
  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      {/* Team 1 Players */}
      <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">{match.team1.name}</h3>
        <div className="space-y-2">
          {match.team1.members.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 bg-[#0a0e1a] rounded-lg hover:bg-[#12161f] transition-colors cursor-pointer"
            >
              <div className="relative">
                {player.avatar_url ? (
                  <img
                    src={player.avatar_url}
                    alt={player.nickname}
                    className="w-10 h-10 rounded-full border-2 border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {player.nickname[0].toUpperCase()}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0e1a] ${getStatusColor(player.status)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{player.nickname}</p>
                <p className="text-xs text-gray-400">{player.role}</p>
              </div>
              {player.id === match.team1.captain_id && (
                <Icon name="Crown" className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team 2 Players */}
      <div className="bg-[#1a1f2e] rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">{match.team2.name}</h3>
        <div className="space-y-2">
          {match.team2.members.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 bg-[#0a0e1a] rounded-lg hover:bg-[#12161f] transition-colors cursor-pointer"
            >
              <div className="relative">
                {player.avatar_url ? (
                  <img
                    src={player.avatar_url}
                    alt={player.nickname}
                    className="w-10 h-10 rounded-full border-2 border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {player.nickname[0].toUpperCase()}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0e1a] ${getStatusColor(player.status)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{player.nickname}</p>
                <p className="text-xs text-gray-400">{player.role}</p>
              </div>
              {player.id === match.team2.captain_id && (
                <Icon name="Crown" className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
