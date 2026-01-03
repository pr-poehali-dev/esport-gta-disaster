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
    if (roundsLeft === 3) return '1/4 ФИНАЛА';
    if (roundsLeft === 4) return '1/8 ФИНАЛА';
    return `РАУНД ${round}`;
  };

  const MATCH_HEIGHT = 100;
  const MATCH_WIDTH = 280;
  const HORIZONTAL_GAP = 80;
  const BASE_GAP = 20;

  // Функция для вычисления Y-позиции карточки
  const getMatchY = (round: number, matchIndex: number): number => {
    if (round === 1) {
      // Первый раунд: карточки идут подряд
      return matchIndex * (MATCH_HEIGHT + BASE_GAP);
    }
    
    // Для следующих раундов: карточка должна быть между двумя карточками предыдущего раунда
    const prevMatch1Y = getMatchY(round - 1, matchIndex * 2);
    const prevMatch2Y = getMatchY(round - 1, matchIndex * 2 + 1);
    
    // Центр между двумя предыдущими карточками (верхний край первой + высота + половина расстояния)
    return prevMatch1Y + (prevMatch2Y - prevMatch1Y) / 2;
  };

  return (
    <div className="relative overflow-x-auto bg-[#0a0e1a] pb-16">
      <div className="relative p-8">
        <div className="flex items-start" style={{ gap: `${HORIZONTAL_GAP}px`, minWidth: 'max-content' }}>
          {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => {
            const roundMatches = getRoundMatches(round);
            
            // Вычисляем высоту контейнера для этого раунда
            const lastMatchY = getMatchY(round, roundMatches.length - 1);
            const containerHeight = lastMatchY + MATCH_HEIGHT + 100;

            return (
              <div key={round} className="relative" style={{ width: `${MATCH_WIDTH}px`, height: `${containerHeight}px` }}>
                <div className="mb-6 flex justify-center sticky top-4 z-30">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg border border-purple-400/30">
                    <Icon name="Trophy" size={16} className="text-white" />
                    <h3 className="text-sm font-bold text-white tracking-wider uppercase">
                      {getRoundName(round)}
                    </h3>
                  </div>
                </div>

                <div className="relative" style={{ height: `${containerHeight}px` }}>
                  {roundMatches.map((match, idx) => {
                    const matchY = getMatchY(round, idx);
                    const nextMatchY = round < rounds ? getMatchY(round + 1, Math.floor(idx / 2)) : 0;
                    
                    return (
                    <div 
                      key={match.id} 
                      className="absolute" 
                      style={{ 
                        top: `${matchY}px`,
                        left: 0,
                        width: `${MATCH_WIDTH}px`,
                        height: `${MATCH_HEIGHT}px` 
                      }}
                    >
                      {/* П-образные линии соединения (рисуем только для верхнего матча в паре) */}
                      {round < rounds && idx % 2 === 0 && (() => {
                        const match1Y = matchY;
                        const match2Y = getMatchY(round, idx + 1);
                        const nextY = nextMatchY;
                        const lineHeight = match2Y - match1Y + MATCH_HEIGHT;
                        
                        return (
                        <svg 
                          className="absolute pointer-events-none" 
                          style={{
                            left: `${MATCH_WIDTH}px`,
                            top: `${MATCH_HEIGHT / 2}px`,
                            width: `${HORIZONTAL_GAP}px`,
                            height: `${lineHeight}px`,
                            overflow: 'visible'
                          }}
                        >
                          {/* Горизонтальная линия от верхнего матча */}
                          <line 
                            x1="0" 
                            y1="0" 
                            x2={HORIZONTAL_GAP / 2} 
                            y2="0" 
                            stroke="rgba(168, 85, 247, 0.6)" 
                            strokeWidth="3" 
                          />
                          
                          {/* Вертикальная перемычка между парой матчей */}
                          <line 
                            x1={HORIZONTAL_GAP / 2} 
                            y1="0" 
                            x2={HORIZONTAL_GAP / 2} 
                            y2={lineHeight - MATCH_HEIGHT / 2} 
                            stroke="rgba(168, 85, 247, 0.6)" 
                            strokeWidth="3" 
                          />
                          
                          {/* Горизонтальная линия от нижнего матча */}
                          <line 
                            x1="0" 
                            y1={lineHeight - MATCH_HEIGHT / 2} 
                            x2={HORIZONTAL_GAP / 2} 
                            y2={lineHeight - MATCH_HEIGHT / 2} 
                            stroke="rgba(168, 85, 247, 0.6)" 
                            strokeWidth="3" 
                          />
                          
                          {/* Горизонтальная линия из центра перемычки к следующему раунду */}
                          <line 
                            x1={HORIZONTAL_GAP / 2} 
                            y1={(lineHeight - MATCH_HEIGHT / 2) / 2} 
                            x2={HORIZONTAL_GAP} 
                            y2={(lineHeight - MATCH_HEIGHT / 2) / 2} 
                            stroke="rgba(168, 85, 247, 0.6)" 
                            strokeWidth="3" 
                          />
                        </svg>
                        );
                      })()}

                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute -top-2 -right-2 opacity-0 hover:opacity-100 transition-opacity z-20 bg-purple-600/90 hover:bg-purple-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMatch(match);
                          }}
                        >
                          <Icon name="Edit" className="h-4 w-4 text-white" />
                        </Button>
                      )}

                      <Card 
                        className="relative bg-[#1a1f2e] border-2 border-purple-500/30 cursor-pointer hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden group h-full"
                        onClick={() => onMatchClick(match)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="p-3 flex flex-col justify-around h-full">
                          <div 
                            className={`flex items-center justify-between px-3 py-2 rounded transition-all ${
                              match.winner_id === match.team1?.id 
                                ? 'bg-purple-600/40 border border-purple-400/60' 
                                : 'bg-[#0a0e1a]/60 border border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {match.team1?.logo_url && (
                                <img src={match.team1.logo_url} alt="" className="w-6 h-6 rounded-full border border-purple-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm font-semibold truncate ${
                                match.winner_id === match.team1?.id ? 'text-white' : 'text-gray-300'
                              }`}>
                                {match.team1?.name || 'TBD'}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-white ml-2 min-w-[30px] text-right">
                              {match.score_team1}
                            </span>
                          </div>

                          <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>

                          <div 
                            className={`flex items-center justify-between px-3 py-2 rounded transition-all ${
                              match.winner_id === match.team2?.id 
                                ? 'bg-purple-600/40 border border-purple-400/60' 
                                : 'bg-[#0a0e1a]/60 border border-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {match.team2?.logo_url && (
                                <img src={match.team2.logo_url} alt="" className="w-6 h-6 rounded-full border border-purple-400 flex-shrink-0" />
                              )}
                              <span className={`text-sm font-semibold truncate ${
                                match.winner_id === match.team2?.id ? 'text-white' : 'text-gray-300'
                              }`}>
                                {match.team2?.name || 'TBD'}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-white ml-2 min-w-[30px] text-right">
                              {match.score_team2}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}