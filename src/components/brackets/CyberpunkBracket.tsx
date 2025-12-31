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
    if (roundsLeft === 3) return '<¼ ФИНАЛА/>';
    return `<1/${Math.pow(2, roundsLeft)}_ФИНАЛА/>`;
  };

  return (
    <div className="relative overflow-x-auto">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDE4MywgMCwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      
      <div className="relative flex gap-8 min-w-max p-8">
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex flex-col gap-8" style={{ minWidth: '340px' }}>
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-500 via-green-500 to-blue-500 rounded border-2 border-amber-400 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-green-500 to-blue-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300 animate-pulse"></div>
                <Icon name="Cpu" size={22} className="text-black relative z-10" />
                <h3 className="text-xl font-black text-black tracking-widest font-mono uppercase relative z-10">
                  {getRoundName(round)}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-col gap-6">
              {getRoundMatches(round).map((match, idx) => (
                <div key={match.id} className="relative group">
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-amber-500 hover:bg-amber-400 text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMatch(match);
                      }}
                    >
                      <Icon name="Edit" className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Card 
                    className="relative bg-black border-2 border-amber-500 cursor-pointer hover:border-green-400 hover:shadow-2xl hover:shadow-amber-500/60 transition-all duration-300 hover:scale-105 overflow-hidden"
                    onClick={() => onMatchClick(match)}
                    style={{
                      animation: `glitch-${idx % 3} 3s infinite`
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-green-500 to-blue-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-amber-500"></div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-green-500/10 opacity-50"></div>
                    
                    <div className="relative p-4 space-y-3 font-mono">
                      <div 
                        className={`relative flex items-center justify-between p-3 border-l-4 transition-all ${
                          match.winner_id === match.team1?.id 
                            ? 'bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/50' 
                            : 'bg-gray-900/60 border-amber-500/30 hover:border-amber-500/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {match.team1?.logo_url && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-amber-500 blur-lg rounded"></div>
                              <img src={match.team1.logo_url} alt="" className="relative w-10 h-10 rounded border-2 border-amber-400" />
                            </div>
                          )}
                          <span className={`font-bold uppercase ${
                            match.winner_id === match.team1?.id ? 'text-amber-300' : 'text-gray-300'
                          }`}>
                            {match.team1?.name || '<TBD/>'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {match.winner_id === match.team1?.id && (
                            <Icon name="Trophy" size={16} className="text-amber-400" />
                          )}
                          <span className="text-2xl font-black text-amber-300 min-w-[45px] text-right bg-black/70 px-3 py-1 border border-amber-500/50">
                            {match.score_team1}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-green-400 to-blue-500"></div>
                      </div>

                      <div 
                        className={`relative flex items-center justify-between p-3 border-l-4 transition-all ${
                          match.winner_id === match.team2?.id 
                            ? 'bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/50' 
                            : 'bg-gray-900/60 border-amber-500/30 hover:border-amber-500/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {match.team2?.logo_url && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-amber-500 blur-lg rounded"></div>
                              <img src={match.team2.logo_url} alt="" className="relative w-10 h-10 rounded border-2 border-amber-400" />
                            </div>
                          )}
                          <span className={`font-bold uppercase ${
                            match.winner_id === match.team2?.id ? 'text-amber-300' : 'text-gray-300'
                          }`}>
                            {match.team2?.name || '<TBD/>'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {match.winner_id === match.team2?.id && (
                            <Icon name="Trophy" size={16} className="text-amber-400" />
                          )}
                          <span className="text-2xl font-black text-amber-300 min-w-[45px] text-right bg-black/70 px-3 py-1 border border-amber-500/50">
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
