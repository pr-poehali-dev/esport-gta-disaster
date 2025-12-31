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

interface CyberpunkBracketProps {
  matches: Match[];
  canEdit: boolean;
  onMatchClick: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}

export default function CyberpunkBracket({ matches, canEdit, onMatchClick, onEditMatch }: CyberpunkBracketProps) {
  const rounds = Math.max(...matches.map(m => m.round));
  
  const getRoundMatches = (round: number) => {
    return matches.filter(m => m.round === round).sort((a, b) => a.match_number - b.match_number);
  };

  const getRoundName = (round: number) => {
    const roundsLeft = rounds - round + 1;
    if (roundsLeft === 1) return '<ФИНАЛ/>';
    if (roundsLeft === 2) return '<ПОЛУФИНАЛ/>';
    if (roundsLeft === 3) return '<¼_ФИНАЛА/>';
    if (roundsLeft === 4) return '<⅛_ФИНАЛА/>';
    return `<РАУНД_${round}/>`;
  };

  const MATCH_HEIGHT = 120;
  const getMatchSpacing = (round: number) => Math.pow(2, round - 1) * MATCH_HEIGHT;

  return (
    <div className="relative overflow-x-auto bg-black">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDE4MywgMCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      
      <div className="relative flex min-w-max p-8" style={{ gap: '80px' }}>
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => {
          const roundMatches = getRoundMatches(round);
          const spacing = getMatchSpacing(round);
          
          return (
            <div key={round} className="relative" style={{ minWidth: '300px' }}>
              <div className="sticky top-0 z-20 mb-8 flex justify-center">
                <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-500 via-green-500 to-blue-500 rounded border-2 border-amber-400 relative overflow-hidden">
                  <Icon name="Cpu" size={20} className="text-black" />
                  <h3 className="text-sm font-black text-black tracking-widest font-mono uppercase">
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
                        className="absolute -top-2 -right-2 opacity-0 hover:opacity-100 transition-opacity z-10 bg-amber-500 hover:bg-amber-400 text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMatch(match);
                        }}
                      >
                        <Icon name="Edit" className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Card 
                      className="relative bg-[#0a0e1a] border-2 border-amber-500/60 cursor-pointer hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 overflow-hidden group"
                      onClick={() => onMatchClick(match)}
                    >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-green-500 to-blue-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-amber-500"></div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-green-500/10 opacity-50"></div>
                    
                    <div className="relative p-3 font-mono">
                      <div 
                        className={`flex items-center justify-between px-3 py-2 border-l-2 transition-all ${
                          match.winner_id === match.team1?.id 
                            ? 'bg-amber-500/20 border-amber-400' 
                            : 'bg-black/40 border-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {match.team1?.logo_url && (
                            <img src={match.team1.logo_url} alt="" className="w-6 h-6 rounded border border-amber-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-bold uppercase truncate ${
                            match.winner_id === match.team1?.id ? 'text-amber-300' : 'text-gray-300'
                          }`}>
                            {match.team1?.name || '<TBD/>'}
                          </span>
                        </div>
                        <span className="text-lg font-black text-amber-300 ml-2 min-w-[35px] text-right">
                          {match.score_team1}
                        </span>
                      </div>

                      <div className="h-px my-1 bg-gradient-to-r from-amber-500 via-green-400 to-blue-500"></div>

                      <div 
                        className={`flex items-center justify-between px-3 py-2 border-l-2 transition-all ${
                          match.winner_id === match.team2?.id 
                            ? 'bg-amber-500/20 border-amber-400' 
                            : 'bg-black/40 border-amber-500/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {match.team2?.logo_url && (
                            <img src={match.team2.logo_url} alt="" className="w-6 h-6 rounded border border-amber-400 flex-shrink-0" />
                          )}
                          <span className={`text-sm font-bold uppercase truncate ${
                            match.winner_id === match.team2?.id ? 'text-amber-300' : 'text-gray-300'
                          }`}>
                            {match.team2?.name || '<TBD/>'}
                          </span>
                        </div>
                        <span className="text-lg font-black text-amber-300 ml-2 min-w-[35px] text-right">
                          {match.score_team2}
                        </span>
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
                        top: `${MATCH_HEIGHT / 2}px`
                      }}
                    >
                      <line 
                        x1="0" 
                        y1="0" 
                        x2="40" 
                        y2="0" 
                        stroke="rgba(245, 158, 11, 0.6)" 
                        strokeWidth="2"
                      />
                      <line 
                        x1="40" 
                        y1="0" 
                        x2="40" 
                        y2={`${spacing}`} 
                        stroke="rgba(245, 158, 11, 0.6)" 
                        strokeWidth="2"
                      />
                      <line 
                        x1="0" 
                        y1={`${spacing}`} 
                        x2="40" 
                        y2={`${spacing}`} 
                        stroke="rgba(245, 158, 11, 0.6)" 
                        strokeWidth="2"
                      />
                      <line 
                        x1="40" 
                        y1={`${spacing / 2}`} 
                        x2="80" 
                        y2={`${spacing / 2}`} 
                        stroke="rgba(245, 158, 11, 0.6)" 
                        strokeWidth="2"
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
      
      <style>{`
        @keyframes glitch-0 {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        @keyframes glitch-1 {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-1px); }
          50% { transform: translateY(1px); }
          75% { transform: translateY(-1px); }
        }
        @keyframes glitch-2 {
          0%, 100% { transform: skewX(0deg); }
          30% { transform: skewX(1deg); }
          60% { transform: skewX(-1deg); }
        }
      `}</style>
    </div>
  );
}