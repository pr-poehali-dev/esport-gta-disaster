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
    if (roundsLeft === 2) return '1/2';
    if (roundsLeft === 3) return '1/4';
    if (roundsLeft === 4) return '1/8';
    if (roundsLeft === 5) return '1/16';
    if (roundsLeft === 6) return '1/32';
    if (roundsLeft === 7) return '1/64';
    if (roundsLeft === 8) return '1/128';
    return `РАУНД ${round}`;
  };

  const MATCH_HEIGHT = 100;
  const ROUND_GAP = 120;
  const getMatchSpacing = (round: number) => Math.pow(2, round - 1) * MATCH_HEIGHT;

  return (
    <div className="relative overflow-x-auto" style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      minHeight: '100vh'
    }}>
      <div className="flex min-w-max p-8 relative" style={{ gap: `${ROUND_GAP}px` }}>
        {/* SVG для всех соединительных линий */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          
          {Array.from({ length: rounds - 1 }, (_, i) => i + 1).map((round) => {
            const roundMatches = getRoundMatches(round);
            const spacing = getMatchSpacing(round);
            const nextSpacing = getMatchSpacing(round + 1);
            const roundOffset = (round - 1) * (280 + ROUND_GAP) + 8;
            
            return roundMatches.map((match, idx) => {
              if (idx % 2 !== 0) return null;
              
              const matchY = spacing / 4 + idx * (spacing / 2 + MATCH_HEIGHT) + MATCH_HEIGHT / 2 + 48;
              const nextMatchIdx = Math.floor(idx / 2);
              const nextMatchY = nextSpacing / 4 + nextMatchIdx * (nextSpacing / 2 + MATCH_HEIGHT) + MATCH_HEIGHT / 2 + 48;
              
              const x1 = roundOffset + 280;
              const y1 = matchY;
              const x2 = x1 + ROUND_GAP / 2;
              const y2 = y1;
              const x3 = x2;
              const y3 = nextMatchY;
              const x4 = roundOffset + 280 + ROUND_GAP;
              const y4 = nextMatchY;
              
              return (
                <g key={`${round}-${idx}`}>
                  {/* Горизонтальная линия от текущего матча */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#goldGradient)"
                    strokeWidth="3"
                    opacity="0.7"
                  />
                  
                  {/* Вертикальная линия к следующему раунду */}
                  <line
                    x1={x2}
                    y1={y1}
                    x2={x3}
                    y2={y3}
                    stroke="url(#goldGradient)"
                    strokeWidth="3"
                    opacity="0.7"
                  />
                  
                  {/* Горизонтальная линия к следующему матчу */}
                  <line
                    x1={x3}
                    y1={y3}
                    x2={x4}
                    y2={y4}
                    stroke="url(#goldGradient)"
                    strokeWidth="3"
                    opacity="0.7"
                  />
                  
                  {/* Линия от нижнего матча пары */}
                  {idx + 1 < roundMatches.length && (
                    <line
                      x1={x1}
                      y1={matchY + spacing / 2 + MATCH_HEIGHT}
                      x2={x2}
                      y2={matchY + spacing / 2 + MATCH_HEIGHT}
                      stroke="url(#goldGradient)"
                      strokeWidth="3"
                      opacity="0.7"
                    />
                  )}
                </g>
              );
            });
          })}
        </svg>

        {/* Раунды */}
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => {
          const roundMatches = getRoundMatches(round);
          const spacing = getMatchSpacing(round);
          
          return (
            <div key={round} className="relative" style={{ minWidth: '280px', zIndex: 1 }}>
              <div className="sticky top-0 z-20 mb-8 flex justify-center">
                <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-lg shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #000000 0%, #2a2a2a 100%)',
                    border: '3px solid',
                    borderImage: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700) 1',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)'
                  }}
                >
                  <div className="absolute inset-0 rounded-lg opacity-20"
                    style={{
                      background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 215, 0, 0.1) 10px, rgba(255, 215, 0, 0.1) 20px)'
                    }}
                  ></div>
                  <Icon name="Trophy" size={18} style={{ color: '#FFD700' }} />
                  <h3 className="text-base font-black tracking-widest uppercase relative z-10"
                    style={{
                      color: '#FFD700',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255, 215, 0, 0.5)',
                      fontFamily: 'Impact, Arial Black, sans-serif',
                      letterSpacing: '0.15em'
                    }}
                  >
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
                        className="absolute -top-2 -right-2 opacity-0 hover:opacity-100 transition-opacity z-10 hover:bg-orange-600"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          color: '#000'
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
                      className="relative cursor-pointer transition-all duration-300 overflow-hidden group"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                        border: '2px solid #FFD700',
                        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 215, 0, 0.1)'
                      }}
                      onClick={() => onMatchClick(match)}
                    >
                      {/* Декоративная полоса сверху */}
                      <div className="absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)'
                        }}
                      ></div>
                      
                      <div className="p-3">
                        {/* Команда 1 */}
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 rounded transition-all"
                          style={{
                            background: match.winner_id === match.team1?.id 
                              ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.25), rgba(255, 165, 0, 0.25))'
                              : 'rgba(0, 0, 0, 0.4)',
                            border: match.winner_id === match.team1?.id 
                              ? '1px solid rgba(255, 215, 0, 0.6)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: match.winner_id === match.team1?.id
                              ? '0 0 10px rgba(255, 215, 0, 0.3)'
                              : 'none'
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {match.team1?.logo_url && (
                              <img 
                                src={match.team1.logo_url} 
                                alt="" 
                                className="w-7 h-7 rounded-full flex-shrink-0"
                                style={{
                                  border: '2px solid #FFD700',
                                  boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)'
                                }}
                              />
                            )}
                            <span 
                              className="text-sm font-bold truncate"
                              style={{
                                color: match.winner_id === match.team1?.id ? '#FFD700' : '#d1d5db',
                                textShadow: match.winner_id === match.team1?.id ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
                                fontFamily: 'Arial Black, sans-serif'
                              }}
                            >
                              {match.team1?.name || 'TBD'}
                            </span>
                          </div>
                          <span 
                            className="text-lg font-black ml-2 min-w-[32px] text-right"
                            style={{
                              color: match.winner_id === match.team1?.id ? '#FFD700' : '#ffffff',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                              fontFamily: 'Impact, sans-serif'
                            }}
                          >
                            {match.score_team1}
                          </span>
                        </div>

                        {/* Разделитель */}
                        <div 
                          className="h-px my-1.5"
                          style={{
                            background: 'linear-gradient(90deg, transparent, #FFD700, transparent)'
                          }}
                        ></div>

                        {/* Команда 2 */}
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 rounded transition-all"
                          style={{
                            background: match.winner_id === match.team2?.id 
                              ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.25), rgba(255, 165, 0, 0.25))'
                              : 'rgba(0, 0, 0, 0.4)',
                            border: match.winner_id === match.team2?.id 
                              ? '1px solid rgba(255, 215, 0, 0.6)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: match.winner_id === match.team2?.id
                              ? '0 0 10px rgba(255, 215, 0, 0.3)'
                              : 'none'
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {match.team2?.logo_url && (
                              <img 
                                src={match.team2.logo_url} 
                                alt="" 
                                className="w-7 h-7 rounded-full flex-shrink-0"
                                style={{
                                  border: '2px solid #FFD700',
                                  boxShadow: '0 0 8px rgba(255, 215, 0, 0.4)'
                                }}
                              />
                            )}
                            <span 
                              className="text-sm font-bold truncate"
                              style={{
                                color: match.winner_id === match.team2?.id ? '#FFD700' : '#d1d5db',
                                textShadow: match.winner_id === match.team2?.id ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
                                fontFamily: 'Arial Black, sans-serif'
                              }}
                            >
                              {match.team2?.name || 'TBD'}
                            </span>
                          </div>
                          <span 
                            className="text-lg font-black ml-2 min-w-[32px] text-right"
                            style={{
                              color: match.winner_id === match.team2?.id ? '#FFD700' : '#ffffff',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                              fontFamily: 'Impact, sans-serif'
                            }}
                          >
                            {match.score_team2}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* КУБОК В КОНЦЕ */}
        <div className="relative flex items-center justify-center" style={{ minWidth: '300px', zIndex: 1 }}>
          <div className="sticky" style={{ top: '50vh', transform: 'translateY(-50%)' }}>
            <div className="flex flex-col items-center gap-6">
              <div 
                className="relative p-8 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #000000 0%, #2a2a2a 50%, #000000 100%)',
                  border: '4px solid',
                  borderImage: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700) 1',
                  boxShadow: '0 0 40px rgba(255, 215, 0, 0.5), inset 0 0 30px rgba(255, 215, 0, 0.1)'
                }}
              >
                <img 
                  src="https://cdn.poehali.dev/files/IMG_9154.png" 
                  alt="Gold Deagle Trophy"
                  className="w-48 h-auto"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}
                />
                
                {/* Декоративные углы */}
                <div 
                  className="absolute top-2 left-2 w-8 h-8"
                  style={{
                    borderTop: '3px solid #FFD700',
                    borderLeft: '3px solid #FFD700'
                  }}
                ></div>
                <div 
                  className="absolute top-2 right-2 w-8 h-8"
                  style={{
                    borderTop: '3px solid #FFD700',
                    borderRight: '3px solid #FFD700'
                  }}
                ></div>
                <div 
                  className="absolute bottom-2 left-2 w-8 h-8"
                  style={{
                    borderBottom: '3px solid #FFD700',
                    borderLeft: '3px solid #FFD700'
                  }}
                ></div>
                <div 
                  className="absolute bottom-2 right-2 w-8 h-8"
                  style={{
                    borderBottom: '3px solid #FFD700',
                    borderRight: '3px solid #FFD700'
                  }}
                ></div>
              </div>
              
              <div 
                className="text-center px-8 py-4 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                  border: '2px solid #FFD700',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                }}
              >
                <h2 
                  className="text-3xl font-black tracking-wider uppercase"
                  style={{
                    color: '#FFD700',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 15px rgba(255, 215, 0, 0.6)',
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    letterSpacing: '0.2em'
                  }}
                >
                  ПОБЕДИТЕЛЬ
                </h2>
                <p 
                  className="text-sm mt-2 font-bold"
                  style={{
                    color: '#FFA500',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  GOLD DEAGLE CHAMPION
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
