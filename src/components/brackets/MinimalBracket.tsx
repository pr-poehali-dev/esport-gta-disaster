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

  const MATCH_HEIGHT = 100;
  const getMatchSpacing = (round: number) => Math.pow(2, round - 1) * MATCH_HEIGHT;

  return (
    <div className="relative overflow-x-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="flex min-w-max p-8" style={{ gap: '80px' }}>
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => {
          const roundMatches = getRoundMatches(round);
          const spacing = getMatchSpacing(round);
          
          return (
            <div key={round} className="relative" style={{ minWidth: '260px' }}>
              <div className="sticky top-0 z-20 mb-8 flex justify-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg shadow-lg border border-white/20">
                  <Icon name="Sparkles" size={16} className="text-white" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {getRoundName(round)}
                  </h3>
                </div>
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
                    className="bg-white/90 backdrop-blur-sm border-2 border-slate-200 cursor-pointer hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-200 transition-all duration-300 group"
                    onClick={() => onMatchClick(match)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                    <div className="p-4 space-y-2">
                      <div 
                        className={`relative flex items-center justify-between py-3 px-4 rounded-lg transition-all ${
                          match.winner_id === match.team1?.id 
                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-300/50' 
                            : 'bg-slate-50 text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50'
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

                      <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-300 to-transparent my-1"></div>

                      <div 
                        className={`relative flex items-center justify-between py-3 px-4 rounded-lg transition-all ${
                          match.winner_id === match.team2?.id 
                            ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-300/50' 
                            : 'bg-slate-50 text-slate-900 hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50'
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
                  {round < rounds && idx % 2 === 0 && (
                    <svg 
                      className="absolute left-full pointer-events-none" 
                      style={{ 
                        width: '80px', 
                        height: `${spacing + MATCH_HEIGHT}px`,
                        top: '0'
                      }}
                    >
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.6 }} />
                          <stop offset="50%" style={{ stopColor: 'rgb(168, 85, 247)', stopOpacity: 0.6 }} />
                          <stop offset="100%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 0.6 }} />
                        </linearGradient>
                      </defs>
                      <line 
                        x1="0" 
                        y1={`${MATCH_HEIGHT / 2}`} 
                        x2="40" 
                        y2={`${MATCH_HEIGHT / 2}`} 
                        stroke="url(#lineGradient)" 
                        strokeWidth="2.5"
                      />
                      <line 
                        x1="40" 
                        y1={`${MATCH_HEIGHT / 2}`} 
                        x2="40" 
                        y2={`${spacing + MATCH_HEIGHT / 2}`} 
                        stroke="url(#lineGradient)" 
                        strokeWidth="2.5"
                      />
                      <line 
                        x1="0" 
                        y1={`${spacing + MATCH_HEIGHT / 2}`} 
                        x2="40" 
                        y2={`${spacing + MATCH_HEIGHT / 2}`} 
                        stroke="url(#lineGradient)" 
                        strokeWidth="2.5"
                      />
                      <line 
                        x1="40" 
                        y1={`${spacing / 2 + MATCH_HEIGHT / 2}`} 
                        x2="80" 
                        y2={`${spacing / 2 + MATCH_HEIGHT / 2}`} 
                        stroke="url(#lineGradient)" 
                        strokeWidth="2.5"
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