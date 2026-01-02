import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Team {
  id: number;
  name: string;
  logo_url: string | null;
}

interface MapScore {
  map_name: string;
  team1_score: number;
  team2_score: number;
}

interface Match {
  id: number;
  round: number;
  team1: Team;
  team2: Team;
  team1_score: number;
  team2_score: number;
  winner_id: number | null;
  status: string;
  scheduled_at: string | null;
  tournament_name: string;
  map_scores: MapScore[];
}

interface MatchDetailsHeaderProps {
  match: Match;
  onBack: () => void;
}

export default function MatchDetailsHeader({ match, onBack }: MatchDetailsHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#1a1f2e] via-[#1e2230] to-[#1a1f2e] rounded-xl border border-white/10 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Назад
        </Button>
        <Button variant="outline" className="border-white/10 text-gray-400">
          <Icon name="Share2" className="h-4 w-4 mr-2" />
          SHARE
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
        {/* Team 1 */}
        <div className="flex items-center justify-end gap-4">
          <div className="text-right">
            <h2 className="text-3xl font-bold text-white mb-1">{match.team1.name}</h2>
            <p className="text-gray-400">BO3</p>
          </div>
          {match.team1.logo_url && (
            <img
              src={match.team1.logo_url}
              alt={match.team1.name}
              className="w-20 h-20 rounded-lg border-2 border-white/10"
            />
          )}
        </div>

        {/* Score */}
        <div className="text-center px-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-black text-white bg-[#0a0e1a] px-6 py-3 rounded-lg">
              {match.team1_score}
            </div>
            <div className="text-2xl text-gray-500">—</div>
            <div className="text-5xl font-black text-white bg-[#0a0e1a] px-6 py-3 rounded-lg">
              {match.team2_score}
            </div>
          </div>
          {match.status === 'completed' ? (
            <div className="mt-4 bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2">
              <p className="text-green-400 font-semibold">МАТЧ ЗАВЕРШЕН</p>
            </div>
          ) : match.status === 'in_progress' ? (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
              <p className="text-red-400 font-semibold">ИДЕТ МАТЧ</p>
            </div>
          ) : (
            <div className="mt-4 bg-orange-500/20 border border-orange-500/30 rounded-lg px-4 py-2">
              <p className="text-orange-400 font-semibold">ОЖИДАНИЕ</p>
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-4">
          {match.team2.logo_url && (
            <img
              src={match.team2.logo_url}
              alt={match.team2.name}
              className="w-20 h-20 rounded-lg border-2 border-white/10"
            />
          )}
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{match.team2.name}</h2>
            <p className="text-gray-400">BO3</p>
          </div>
        </div>
      </div>

      {/* Tournament Info */}
      <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="Trophy" className="h-5 w-5 text-yellow-500" />
          <span className="text-gray-300">{match.tournament_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Icon name="Calendar" className="h-4 w-4" />
          <span>Round {match.round}</span>
        </div>
      </div>

      {/* Maps Scoreboard */}
      <div className="mt-6 space-y-2">
        {match.map_scores.map((mapScore, index) => (
          <div key={index} className="bg-[#0a0e1a] rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400 uppercase">{mapScore.map_name}</span>
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${mapScore.team1_score > mapScore.team2_score ? 'text-green-400' : 'text-white'}`}>
                  {mapScore.team1_score}
                </span>
                <span className="text-gray-500">:</span>
                <span className={`text-lg font-bold ${mapScore.team2_score > mapScore.team1_score ? 'text-green-400' : 'text-white'}`}>
                  {mapScore.team2_score}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
