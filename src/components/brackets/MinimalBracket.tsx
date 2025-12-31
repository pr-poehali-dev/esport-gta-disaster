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

interface MinimalBracketProps {
  matches: Match[];
  canEdit: boolean;
  onMatchClick: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}

export default function MinimalBracket({ matches, canEdit, onMatchClick, onEditMatch }: MinimalBracketProps) {
  const rounds = Math.max(...matches.map(m => m.round));
  
  const getRoundMatches = (round: number) => {
    return matches.filter(m => m.round === round).sort((a, b) => a.match_number - b.match_number);
  };

  const getRoundName = (round: number) => {
    const roundsLeft = rounds - round + 1;
    if (roundsLeft === 1) return 'Финал';
    if (roundsLeft === 2) return 'Полуфинал';
    if (roundsLeft === 3) return '1/4 финала';
    if (roundsLeft === 4) return '1/8 финала';
    return `Раунд ${round}`;
  };

  const getMatchHeight = () => 100;
  const getMatchSpacing = (round: number) => Math.pow(2, round - 1) * getMatchHeight();

  return (
    <div className="relative overflow-x-auto bg-white">
      <div className="flex min-w-max p-8" style={{ gap: '80px' }}>
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => {
          const roundMatches = getRoundMatches(round);
          const spacing = getMatchSpacing(round);
          
          return (
            <div key={round} className="relative" style={{ minWidth: '260px' }}>
              <div className="sticky top-0 z-20 mb-6 text-center">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  {getRoundName(round)}
                </h3>
                <div className="h-px w-12 mx-auto mt-2 bg-slate-300"></div>
              </div>
              
              <div className="relative">
                {roundMatches.map((match, idx) => (
                  <div 
                    key={match.id} 
                    className="relative"
                    style={{ 
                      marginTop: idx === 0 ? `${spacing / 4}px` : `${spacing / 2}px`
                    }}
                  >
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMatch(match);
                      }}
                    >
                      <Icon name="Edit" className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Card 
                    className="bg-white border border-slate-200 cursor-pointer hover:border-slate-400 hover:shadow-lg transition-all duration-200"
                    onClick={() => onMatchClick(match)}
                  >
                    <div className="p-4 space-y-2">
                      <div 
                        className={`flex items-center justify-between py-3 px-4 rounded transition-all ${
                          match.winner_id === match.team1?.id 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {match.team1?.logo_url && (
                            <img 
                              src={match.team1.logo_url} 
                              alt="" 
                              className={`w-8 h-8 rounded-full ${
                                match.winner_id === match.team1?.id ? 'border-2 border-white' : 'border border-slate-300'
                              }`}
                            />
                          )}
                          <span className="font-medium text-sm">
                            {match.team1?.name || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {match.winner_id === match.team1?.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          )}
                          <span className="text-lg font-semibold min-w-[30px] text-right">
                            {match.score_team1}
                          </span>
                        </div>
                      </div>

                      <div className="h-px w-full bg-slate-200"></div>

                      <div 
                        className={`flex items-center justify-between py-3 px-4 rounded transition-all ${
                          match.winner_id === match.team2?.id 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {match.team2?.logo_url && (
                            <img 
                              src={match.team2.logo_url} 
                              alt="" 
                              className={`w-8 h-8 rounded-full ${
                                match.winner_id === match.team2?.id ? 'border-2 border-white' : 'border border-slate-300'
                              }`}
                            />
                          )}
                          <span className="font-medium text-sm">
                            {match.team2?.name || 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {match.winner_id === match.team2?.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          )}
                          <span className="text-lg font-semibold min-w-[30px] text-right">
                            {match.score_team2}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Соединительные линии */}
                  {round < rounds && (
                    <svg 
                      className="absolute left-full top-1/2 pointer-events-none" 
                      style={{ 
                        width: '80px', 
                        height: idx % 2 === 0 ? `${spacing / 2 + 50}px` : `${spacing / 2 + 50}px`,
                        transform: 'translateY(-50%)'
                      }}
                    >
                      <line 
                        x1="0" 
                        y1="50%" 
                        x2="40" 
                        y2="50%" 
                        stroke="rgba(148, 163, 184, 0.4)" 
                        strokeWidth="1.5"
                      />
                      <line 
                        x1="40" 
                        y1="50%" 
                        x2="40" 
                        y2={idx % 2 === 0 ? `${spacing / 4 + 50}` : `${-spacing / 4}`} 
                        stroke="rgba(148, 163, 184, 0.4)" 
                        strokeWidth="1.5"
                      />
                      <line 
                        x1="40" 
                        y1={idx % 2 === 0 ? `${spacing / 4 + 50}` : `${-spacing / 4}`} 
                        x2="80" 
                        y2={idx % 2 === 0 ? `${spacing / 4 + 50}` : `${-spacing / 4}`} 
                        stroke="rgba(148, 163, 184, 0.4)" 
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </div>
              ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}