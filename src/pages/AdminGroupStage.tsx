import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Team {
  id: number;
  name: string;
  logo_url?: string;
}

interface GroupMatch {
  id?: number;
  group_name: string;
  team1_id: number;
  team2_id: number;
  team1_score: number;
  team2_score: number;
  played: boolean;
}

interface GroupStanding {
  team_id: number;
  team_name: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export default function AdminGroupStage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groupMatches, setGroupMatches] = useState<GroupMatch[]>([]);
  const [groupStandings, setGroupStandings] = useState<Record<string, GroupStanding[]>>({});
  const [user, setUser] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('A');

  const groups = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      if (!['admin', 'founder', 'moderator'].includes(userData.role)) {
        showNotification('error', 'Доступ запрещен', 'У вас нет прав администратора');
        navigate('/');
        return;
      }
    } else {
      navigate('/');
      return;
    }

    loadGroupStageData();
  }, [tournamentId]);

  const loadGroupStageData = async () => {
    try {
      const userId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : '');
      
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'get_group_stage',
          tournament_id: tournamentId
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTeams(data.teams || []);
        setGroupMatches(data.matches || []);
        setGroupStandings(data.standings || {});
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroupStage = async () => {
    if (teams.length < 16) {
      showNotification('error', 'Ошибка', 'Недостаточно команд. Необходимо минимум 16 команд для групповой стадии.');
      return;
    }

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'create_group_stage',
          tournament_id: tournamentId
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', 'Групповая стадия создана');
        loadGroupStageData();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleUpdateMatch = async (match: GroupMatch) => {
    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'update_group_match',
          tournament_id: tournamentId,
          match_id: match.id,
          team1_score: match.team1_score,
          team2_score: match.team2_score,
          played: match.played
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', 'Результат обновлен');
        loadGroupStageData();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleFinalizeGroupStage = async () => {
    if (!confirm('Завершить групповую стадию и создать плей-офф? Топ-2 команды из каждой группы пройдут в плей-офф.')) return;

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'finalize_group_stage',
          tournament_id: tournamentId
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', data.message);
        navigate(`/tournaments/${tournamentId}/bracket`);
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleScoreChange = (matchId: number | undefined, field: 'team1_score' | 'team2_score', value: string) => {
    const score = parseInt(value) || 0;
    setGroupMatches(prev =>
      prev.map(m =>
        m.id === matchId ? { ...m, [field]: score } : m
      )
    );
  };

  const toggleMatchPlayed = (matchId: number | undefined) => {
    setGroupMatches(prev =>
      prev.map(m =>
        m.id === matchId ? { ...m, played: !m.played } : m
      )
    );
  };

  const getTeamName = (teamId: number) => {
    return teams.find(t => t.id === teamId)?.name || 'Неизвестная команда';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const groupMatchesFiltered = groupMatches.filter(m => m.group_name === selectedGroup);
  const currentStandings = groupStandings[selectedGroup] || [];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin/tournaments')}
              className="bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Управление групповой стадией
            </h1>
          </div>

          <div className="flex gap-3">
            {groupMatches.length === 0 ? (
              <Button
                onClick={handleCreateGroupStage}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Icon name="Plus" className="h-4 w-4 mr-2" />
                Создать групповую стадию
              </Button>
            ) : (
              <Button
                onClick={handleFinalizeGroupStage}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                Завершить группы и создать плей-офф
              </Button>
            )}
          </div>
        </div>

        {groupMatches.length === 0 ? (
          <Card className="bg-[#1a1f2e] border-white/10 p-12 text-center">
            <Icon name="Trophy" className="h-16 w-16 mx-auto mb-4 text-purple-400" />
            <h3 className="text-xl font-bold mb-2">Групповая стадия не создана</h3>
            <p className="text-gray-400 mb-6">
              Необходимо минимум 16 зарегистрированных команд для создания групповой стадии
            </p>
            <p className="text-sm text-gray-500">Зарегистрировано команд: {teams.length}</p>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-2 mb-6">
              {groups.map(group => (
                <Button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`${
                    selectedGroup === group
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-white/5 hover:bg-white/10'
                  } border border-white/10`}
                >
                  Группа {group}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1f2e] border-white/10 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Calendar" className="h-5 w-5 text-purple-400" />
                  Матчи группы {selectedGroup}
                </h2>
                <div className="space-y-4">
                  {groupMatchesFiltered.map((match, idx) => (
                    <div
                      key={match.id || idx}
                      className="bg-[#0a0e1a] border border-white/10 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Матч {idx + 1}</span>
                        <Button
                          size="sm"
                          onClick={() => {
                            toggleMatchPlayed(match.id);
                            setTimeout(() => {
                              const updatedMatch = groupMatches.find(m => m.id === match.id);
                              if (updatedMatch) handleUpdateMatch(updatedMatch);
                            }, 100);
                          }}
                          className={`${
                            match.played
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-white/5 text-gray-400 border-white/10'
                          } border`}
                        >
                          <Icon
                            name={match.played ? 'CheckCircle' : 'Circle'}
                            className="h-4 w-4 mr-1"
                          />
                          {match.played ? 'Сыгран' : 'Не сыгран'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        <div className="text-right">
                          <p className="font-semibold">{getTeamName(match.team1_id)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={match.team1_score}
                            onChange={(e) => handleScoreChange(match.id, 'team1_score', e.target.value)}
                            onBlur={() => handleUpdateMatch(match)}
                            className="w-16 text-center bg-white/5 border-white/10"
                          />
                          <span className="text-gray-400">:</span>
                          <Input
                            type="number"
                            min="0"
                            value={match.team2_score}
                            onChange={(e) => handleScoreChange(match.id, 'team2_score', e.target.value)}
                            onBlur={() => handleUpdateMatch(match)}
                            className="w-16 text-center bg-white/5 border-white/10"
                          />
                        </div>

                        <div>
                          <p className="font-semibold">{getTeamName(match.team2_id)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-[#1a1f2e] border-white/10 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Icon name="Trophy" className="h-5 w-5 text-purple-400" />
                  Турнирная таблица группы {selectedGroup}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-sm text-gray-400">
                        <th className="text-left py-2 px-2">#</th>
                        <th className="text-left py-2 px-2">Команда</th>
                        <th className="text-center py-2 px-2">И</th>
                        <th className="text-center py-2 px-2">В</th>
                        <th className="text-center py-2 px-2">Н</th>
                        <th className="text-center py-2 px-2">П</th>
                        <th className="text-center py-2 px-2">Г</th>
                        <th className="text-center py-2 px-2">Очки</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentStandings.map((standing, idx) => (
                        <tr
                          key={standing.team_id}
                          className={`border-b border-white/5 ${
                            idx < 2 ? 'bg-green-500/10' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-sm">{idx + 1}</td>
                          <td className="py-3 px-2 font-semibold">{standing.team_name}</td>
                          <td className="py-3 px-2 text-center text-sm">{standing.matches_played}</td>
                          <td className="py-3 px-2 text-center text-sm">{standing.wins}</td>
                          <td className="py-3 px-2 text-center text-sm">{standing.draws}</td>
                          <td className="py-3 px-2 text-center text-sm">{standing.losses}</td>
                          <td className="py-3 px-2 text-center text-sm text-gray-400">
                            {standing.goals_for}:{standing.goals_against}
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-purple-400">
                            {standing.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  * Топ-2 команды из каждой группы проходят в плей-офф
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}