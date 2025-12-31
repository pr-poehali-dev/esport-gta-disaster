import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Team {
  id: number;
  name: string;
  logo_url?: string;
}

interface Match {
  id: number;
  round: number;
  match_number: number;
  team1: Team | null;
  team2: Team | null;
  winner_id: number | null;
  score_team1: number;
  score_team2: number;
  status: string;
}

interface EsportsBracketProps {
  matches: Match[];
  canEdit: boolean;
  onMatchClick: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}

export default function EsportsBracket({ matches, canEdit, onMatchClick, onEditMatch }: EsportsBracketProps) {
  const rounds = Math.max(...matches.map(m => m.round));
  
  const getRoundMatches = (round: number) => {
    return matches.filter(m => m.round === round).sort((a, b) => a.match_number - b.match_number);
  };

  const getRoundName = (round: number) => {
    const roundsLeft = rounds - round + 1;
    if (roundsLeft === 1) return 'ФИНАЛ';
    if (roundsLeft === 2) return 'ПОЛУФИНАЛ';
    if (roundsLeft === 3) return 'ЧЕТВЕРТЬФИНАЛ';
    return `1/${Math.pow(2, roundsLeft)} ФИНАЛА`;
  };

  return (
    <div className="relative overflow-x-auto">
      <div className="flex gap-8 min-w-max p-8">
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex flex-col gap-8" style={{ minWidth: '320px' }}>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-full">
                <Icon name="Zap" size={20} className="text-white" />
                <h3 className="text-xl font-black text-white tracking-wider uppercase">
                  {getRoundName(round)}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              {getRoundMatches(round).map((match) => (
                <div key={match.id} className="relative group">
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-purple-600/90 hover:bg-purple-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMatch(match);
                      }}
                    >
                      <Icon name="Edit" className="h-4 w-4 text-white" />
                    </Button>
                  )}
                  
                  <Card 
                    className="bg-gradient-to-br from-purple-900/50 via-pink-900/40 to-cyan-900/30 border-2 border-purple-500/50 backdrop-blur-xl cursor-pointer hover:border-pink-400 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105 overflow-hidden"
                    onClick={() => onMatchClick(match)}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
                    
                    <div className="p-4 space-y-3">
                      <div 
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          match.winner_id === match.team1?.id 
                            ? 'bg-gradient-to-r from-purple-600/60 to-pink-600/60 border-2 border-purple-400 shadow-lg shadow-purple-500/50' 
                            : 'bg-black/40 border border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {match.team1?.logo_url && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-purple-500 blur-md rounded-full"></div>
                              <img src={match.team1.logo_url} alt="" className="relative w-10 h-10 rounded-full border-2 border-purple-400" />
                            </div>
                          )}
                          <span className={`font-bold ${
                            match.winner_id === match.team1?.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {match.team1?.name || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {match.winner_id === match.team1?.id && (
                            <Icon name="Trophy" size={16} className="text-yellow-400" />
                          )}
                          <span className="text-2xl font-black text-white min-w-[40px] text-right bg-purple-900/50 px-3 py-1 rounded-lg">
                            {match.score_team1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="h-[2px] w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
                      </div>

                      <div 
                        className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                          match.winner_id === match.team2?.id 
                            ? 'bg-gradient-to-r from-purple-600/60 to-pink-600/60 border-2 border-purple-400 shadow-lg shadow-purple-500/50' 
                            : 'bg-black/40 border border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {match.team2?.logo_url && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-purple-500 blur-md rounded-full"></div>
                              <img src={match.team2.logo_url} alt="" className="relative w-10 h-10 rounded-full border-2 border-purple-400" />
                            </div>
                          )}
                          <span className={`font-bold ${
                            match.winner_id === match.team2?.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {match.team2?.name || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {match.winner_id === match.team2?.id && (
                            <Icon name="Trophy" size={16} className="text-yellow-400" />
                          )}
                          <span className="text-2xl font-black text-white min-w-[40px] text-right bg-purple-900/50 px-3 py-1 rounded-lg">
                            {match.score_team2}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
