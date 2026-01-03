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

interface GoldDeagleBracketProps {
  matches: Match[];
  canEdit: boolean;
  onMatchClick: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}

export default function GoldDeagleBracket({ matches, canEdit, onMatchClick, onEditMatch }: GoldDeagleBracketProps) {
  const rounds = Math.max(...matches.map(m => m.round));
  
  const getRoundMatches = (round: number) => {
    return matches.filter(m => m.round === round).sort((a, b) => a.match_number - b.match_number);
  };

  const getRoundName = (round: number) => {
    const roundsLeft = rounds - round + 1;
    if (roundsLeft === 1) return 'ФИНАЛ';
    if (roundsLeft === 2) return 'ПОЛУФИНАЛ';
    if (roundsLeft === 3) return '1/4';
    if (roundsLeft === 4) return '1/8';
    if (roundsLeft === 5) return '1/16';
    return `РАУНД ${round}`;
  };

  const MATCH_HEIGHT = 100;
  const MATCH_WIDTH = 280;
  const HORIZONTAL_GAP = 80;

  return (
    <div className="relative overflow-x-auto pb-16" style={{
      background: 'radial-gradient(ellipse at center, #1a1100 0%, #000000 100%)'
    }}>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 50px, #FFD700 50px, #FFD700 51px)',
      }}></div>

      <div className="relative p-8">
        <div className="flex" style={{ gap: `${HORIZONTAL_GAP}px`, minWidth: 'max-content' }}>
          {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => {
            const roundMatches = getRoundMatches(round);
            const verticalGap = round === 1 ? 20 : Math.pow(2, round - 1) * 60;

            return (
              <div key={round} className="relative" style={{ width: `${MATCH_WIDTH}px` }}>
                <div className="mb-6 flex justify-center sticky top-4 z-30">
                  <div className="relative inline-flex items-center gap-3 px-8 py-4 rounded-xl shadow-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #1a1100 0%, #332200 50%, #1a1100 100%)',
                      border: '3px solid #FFD700',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(255, 165, 0, 0.2)'
                    }}
                  >
                    <Icon name="Trophy" size={24} style={{ color: '#FFD700', filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' }} />
                    <h3 className="text-xl font-black tracking-widest uppercase"
                      style={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                        fontFamily: 'Impact, Arial Black, sans-serif'
                      }}
                    >
                      {getRoundName(round)}
                    </h3>
                  </div>
                </div>

                <div className="relative flex flex-col" style={{ gap: `${verticalGap}px` }}>
                  {roundMatches.map((match, idx) => (
                    <div key={match.id} className="relative" style={{ height: `${MATCH_HEIGHT}px` }}>
                      {/* Линии соединения */}
                      {round < rounds && (
                        <svg 
                          className="absolute pointer-events-none" 
                          style={{
                            left: `${MATCH_WIDTH}px`,
                            top: `${MATCH_HEIGHT / 2}px`,
                            width: `${HORIZONTAL_GAP}px`,
                            height: idx % 2 === 0 ? `${verticalGap + MATCH_HEIGHT / 2}px` : '2px',
                            overflow: 'visible'
                          }}
                        >
                          <defs>
                            <linearGradient id={`gold-${round}-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
                              <stop offset="100%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
                            </linearGradient>
                          </defs>
                          {idx % 2 === 0 ? (
                            <>
                              <line x1="0" y1="0" x2={HORIZONTAL_GAP / 2} y2="0" stroke={`url(#gold-${round}-${idx})`} strokeWidth="4" />
                              <line x1={HORIZONTAL_GAP / 2} y1="0" x2={HORIZONTAL_GAP / 2} y2={verticalGap + MATCH_HEIGHT / 2} stroke={`url(#gold-${round}-${idx})`} strokeWidth="4" />
                              <line x1={HORIZONTAL_GAP / 2} y1={(verticalGap + MATCH_HEIGHT / 2) / 2} x2={HORIZONTAL_GAP} y2={(verticalGap + MATCH_HEIGHT / 2) / 2} stroke={`url(#gold-${round}-${idx})`} strokeWidth="4" />
                            </>
                          ) : (
                            <line x1="0" y1="0" x2={HORIZONTAL_GAP / 2} y2="0" stroke={`url(#gold-${round}-${idx})`} strokeWidth="4" />
                          )}
                        </svg>
                      )}

                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute -top-2 -right-2 opacity-0 hover:opacity-100 transition-opacity z-20"
                          style={{
                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                            color: '#000',
                            fontWeight: 'bold'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMatch(match);
                          }}
                        >
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                      )}

                      <Card 
                        className="relative cursor-pointer transition-all duration-300 overflow-hidden group h-full"
                        style={{
                          background: 'linear-gradient(135deg, #1a1100 0%, #2d1f00 50%, #1a1100 100%)',
                          border: '3px solid #FFD700',
                          boxShadow: '0 8px 24px rgba(255, 215, 0, 0.3), inset 0 2px 0 rgba(255, 215, 0, 0.2)'
                        }}
                        onClick={() => onMatchClick(match)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1" style={{
                          background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)'
                        }}></div>

                        <div className="p-4 flex flex-col justify-around h-full">
                          <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                            match.winner_id === match.team1?.id ? 'bg-gradient-to-r from-yellow-900/40 to-transparent' : ''
                          }`}>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 flex items-center justify-center flex-shrink-0 border border-yellow-600/30">
                              {match.team1?.logo_url ? (
                                <img src={match.team1.logo_url} alt={match.team1.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Icon name="Shield" className="h-5 w-5" style={{ color: '#FFD700' }} />
                              )}
                            </div>
                            <span className={`flex-1 font-bold truncate ${
                              match.winner_id === match.team1?.id ? 'text-yellow-400' : 'text-yellow-100'
                            }`} style={{ fontSize: '0.9rem' }}>
                              {match.team1?.name || 'TBD'}
                            </span>
                            <span className="text-xl font-black min-w-[28px] text-center" style={{
                              color: match.winner_id === match.team1?.id ? '#FFD700' : '#8B7355',
                              textShadow: match.winner_id === match.team1?.id ? '0 0 10px rgba(255, 215, 0, 0.8)' : 'none'
                            }}>
                              {match.score_team1}
                            </span>
                          </div>

                          <div className="h-px" style={{
                            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                            opacity: 0.3
                          }}></div>

                          <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                            match.winner_id === match.team2?.id ? 'bg-gradient-to-r from-yellow-900/40 to-transparent' : ''
                          }`}>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 flex items-center justify-center flex-shrink-0 border border-yellow-600/30">
                              {match.team2?.logo_url ? (
                                <img src={match.team2.logo_url} alt={match.team2.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Icon name="Shield" className="h-5 w-5" style={{ color: '#FFD700' }} />
                              )}
                            </div>
                            <span className={`flex-1 font-bold truncate ${
                              match.winner_id === match.team2?.id ? 'text-yellow-400' : 'text-yellow-100'
                            }`} style={{ fontSize: '0.9rem' }}>
                              {match.team2?.name || 'TBD'}
                            </span>
                            <span className="text-xl font-black min-w-[28px] text-center" style={{
                              color: match.winner_id === match.team2?.id ? '#FFD700' : '#8B7355',
                              textShadow: match.winner_id === match.team2?.id ? '0 0 10px rgba(255, 215, 0, 0.8)' : 'none'
                            }}>
                              {match.score_team2}
                            </span>
                          </div>
                        </div>

                        {round === rounds && match.winner_id && (
                          <div className="absolute -right-6 top-1/2 -translate-y-1/2 animate-pulse">
                            <Icon name="Trophy" size={40} style={{ 
                              color: '#FFD700',
                              filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 1))'
                            }} />
                          </div>
                        )}
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
