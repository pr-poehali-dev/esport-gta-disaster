import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

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

interface ChampionshipBracketProps {
  matches: Match[];
  canEdit: boolean;
  onMatchClick: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}

interface GroupStanding {
  team: Team;
  wins: number;
  losses: number;
  points: number;
}

export default function ChampionshipBracket({ matches, canEdit, onMatchClick, onEditMatch }: ChampionshipBracketProps) {
  const [activeTab, setActiveTab] = useState<'groups' | 'playoffs'>('groups');
  
  const rounds = Math.max(...matches.map(m => m.round));
  
  const getRoundMatches = (round: number) => {
    return matches.filter(m => m.round === round).sort((a, b) => a.match_number - b.match_number);
  };

  const getRoundName = (round: number) => {
    const roundsLeft = rounds - round + 1;
    if (roundsLeft === 1) return 'ФИНАЛ';
    if (roundsLeft === 2) return 'ПОЛУФИНАЛ';
    if (roundsLeft === 3) return 'ЧЕТВЕРТЬФИНАЛ';
    if (roundsLeft === 4) return '1/8 ФИНАЛА';
    return `РАУНД ${round}`;
  };

  const MATCH_HEIGHT = 120;
  const getMatchSpacing = (round: number) => Math.pow(2, round - 1) * MATCH_HEIGHT;

  const generateMockGroups = (): { [key: string]: GroupStanding[] } => {
    const allTeams: Team[] = [];
    matches.forEach(match => {
      if (match.team1 && !allTeams.find(t => t.id === match.team1!.id)) {
        allTeams.push(match.team1);
      }
      if (match.team2 && !allTeams.find(t => t.id === match.team2!.id)) {
        allTeams.push(match.team2);
      }
    });

    const groups: { [key: string]: GroupStanding[] } = {};
    const groupNames = ['A', 'B', 'C', 'D'];
    const teamsPerGroup = Math.ceil(allTeams.length / 4);

    groupNames.forEach((groupName, idx) => {
      const groupTeams = allTeams.slice(idx * teamsPerGroup, (idx + 1) * teamsPerGroup);
      groups[groupName] = groupTeams.map(team => ({
        team,
        wins: Math.floor(Math.random() * 4),
        losses: Math.floor(Math.random() * 4),
        points: Math.floor(Math.random() * 12)
      })).sort((a, b) => b.points - a.points);
    });

    return groups;
  };

  const mockGroups = generateMockGroups();

  return (
    <div className="relative overflow-x-auto bg-[#0a0e1a]">
      <div className="sticky top-0 z-30 bg-[#0a0e1a] border-b border-white/10">
        <div className="flex justify-center gap-4 p-4">
          <Button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'groups'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-[#1a1f2e] text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Icon name="Users" size={18} className="mr-2" />
            ГРУППОВАЯ СТАДИЯ
          </Button>
          <Button
            onClick={() => setActiveTab('playoffs')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'playoffs'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-lg shadow-purple-500/50'
                : 'bg-[#1a1f2e] text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <Icon name="Trophy" size={18} className="mr-2" />
            ПЛЕЙ-ОФФ
          </Button>
        </div>
      </div>

      {activeTab === 'groups' && (
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Object.entries(mockGroups).map(([groupName, standings]) => (
              <Card key={groupName} className="bg-[#1a1f2e] border-2 border-purple-500/30 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 px-6 py-4">
                  <h3 className="text-2xl font-black text-white text-center tracking-wider">
                    ГРУППА {groupName}
                  </h3>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-3 px-4 py-2 text-xs font-bold text-gray-400 border-b border-white/10">
                      <div className="w-8 text-center">#</div>
                      <div>КОМАНДА</div>
                      <div className="w-12 text-center">В</div>
                      <div className="w-12 text-center">П</div>
                      <div className="w-12 text-center">О</div>
                    </div>
                    
                    {standings.map((standing, idx) => (
                      <div
                        key={standing.team.id}
                        className={`grid grid-cols-[auto,1fr,auto,auto,auto] gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                          idx < 2
                            ? 'bg-purple-600/20 border border-purple-400/40 hover:bg-purple-600/30'
                            : 'bg-[#0a0e1a]/60 border border-white/5 hover:bg-[#0a0e1a]'
                        }`}
                      >
                        <div className="w-8 text-center">
                          <span className={`text-sm font-bold ${idx < 2 ? 'text-purple-400' : 'text-gray-400'}`}>
                            {idx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          {standing.team.logo_url && (
                            <img 
                              src={standing.team.logo_url} 
                              alt="" 
                              className="w-6 h-6 rounded-full border border-purple-400 flex-shrink-0" 
                            />
                          )}
                          <span className="text-sm font-semibold text-white truncate">
                            {standing.team.name}
                          </span>
                        </div>
                        <div className="w-12 text-center text-sm font-bold text-green-400">
                          {standing.wins}
                        </div>
                        <div className="w-12 text-center text-sm font-bold text-red-400">
                          {standing.losses}
                        </div>
                        <div className="w-12 text-center text-sm font-black text-purple-400">
                          {standing.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-4 bg-[#1a1f2e] border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Icon name="Info" size={16} className="text-purple-400" />
              <span>Топ-2 команды из каждой группы проходят в плей-офф</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'playoffs' && (
        <div className="flex min-w-max p-8" style={{ gap: '80px' }}>
          {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => {
            const roundMatches = getRoundMatches(round);
            const spacing = getMatchSpacing(round);
            
            return (
              <div key={round} className="relative" style={{ minWidth: '280px' }}>
                <div className="sticky top-0 z-20 mb-8 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-lg shadow-lg border border-purple-400/30">
                    <Icon name="Trophy" size={16} className="text-white" />
                    <h3 className="text-sm font-bold text-white tracking-wider uppercase">
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
                          className="absolute -top-2 -right-2 opacity-0 hover:opacity-100 transition-opacity z-10 bg-purple-600/90 hover:bg-purple-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMatch(match);
                          }}
                        >
                          <Icon name="Edit" className="h-4 w-4 text-white" />
                        </Button>
                      )}
                      
                      <Card 
                        className="relative bg-[#1a1f2e] border-2 border-purple-500/30 cursor-pointer hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden group"
                        onClick={() => onMatchClick(match)}
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="p-3">
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

                          <div className="h-px my-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>

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

                      {round < rounds && idx % 2 === 0 && (
                        <svg 
                          className="absolute left-full pointer-events-none" 
                          style={{ 
                            width: '80px', 
                            height: `${spacing + MATCH_HEIGHT}px`,
                            top: '0'
                          }}
                        >
                          <line 
                            x1="0" 
                            y1={`${MATCH_HEIGHT / 2}`} 
                            x2="40" 
                            y2={`${MATCH_HEIGHT / 2}`} 
                            stroke="rgba(168, 85, 247, 0.6)" 
                            strokeWidth="2"
                          />
                          <line 
                            x1="40" 
                            y1={`${MATCH_HEIGHT / 2}`} 
                            x2="40" 
                            y2={`${spacing + MATCH_HEIGHT / 2}`} 
                            stroke="rgba(168, 85, 247, 0.6)" 
                            strokeWidth="2"
                          />
                          <line 
                            x1="0" 
                            y1={`${spacing + MATCH_HEIGHT / 2}`} 
                            x2="40" 
                            y2={`${spacing + MATCH_HEIGHT / 2}`} 
                            stroke="rgba(168, 85, 247, 0.6)" 
                            strokeWidth="2"
                          />
                          <line 
                            x1="40" 
                            y1={`${spacing / 2 + MATCH_HEIGHT / 2}`} 
                            x2="80" 
                            y2={`${spacing / 2 + MATCH_HEIGHT / 2}`} 
                            stroke="rgba(168, 85, 247, 0.6)" 
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
      )}
    </div>
  );
}
