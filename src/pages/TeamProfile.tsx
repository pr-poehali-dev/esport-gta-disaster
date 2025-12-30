import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Team } from '@/services/api';
import TeamLevelBadge from '@/components/TeamLevelBadge';
import ManageTeamMembersDialog from '@/components/ManageTeamMembersDialog';

interface TeamMember {
  id: number;
  user_id: number;
  nickname: string;
  avatar_url: string | null;
  member_role: string;
  joined_at: string;
}

interface Match {
  id: number;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  date: string;
  tournament: string;
}

const API_BASE = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';

export default function TeamProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      console.log('Current user loaded:', user);
    } else {
      console.log('No user in localStorage');
    }
  }, []);

  useEffect(() => {
    const loadTeam = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': currentUser?.id?.toString() || '0'
          },
          body: JSON.stringify({
            action: 'get_team_by_id',
            team_id: parseInt(id)
          })
        });
        
        if (!response.ok) throw new Error('Ошибка загрузки команды');
        
        const data = await response.json();
        
        if (data.team) {
          setTeam(data.team);
          setMembers(data.team.members || []);
          console.log('Team loaded:', { 
            captain_id: data.team.captain_id, 
            currentUserId: currentUser?.id,
            willShowButton: currentUser && data.team.captain_id === currentUser.id 
          });
        } else {
          setError('Команда не найдена');
        }
      } catch (err) {
        console.error('Error loading team:', err);
        setError('Ошибка загрузки данных команды');
      } finally {
        setLoading(false);
      }
    };
    
    loadTeam();
  }, [id]);

  const matches: Match[] = [];

  const getRatingColor = (rating: number) => {
    if (rating >= 1700) return 'text-yellow-500';
    if (rating >= 1500) return 'text-purple-500';
    if (rating >= 1300) return 'text-blue-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-12">Загрузка...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <Button variant="ghost" onClick={() => navigate('/teams')} className="mb-6">
              <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Назад к командам
            </Button>
            <div className="text-center py-12 text-muted-foreground">{error || 'Команда не найдена'}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const winRate = team.win_rate || Math.round((team.wins / (team.wins + team.losses + (team.draws || 0))) * 100) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate('/teams')} className="mb-6">
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Назад к командам
          </Button>

          {/* Debug Panel */}
          {showDebug && (
            <Card className="p-4 mb-6 bg-yellow-50 border-yellow-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-yellow-900">🔍 Отладочная информация</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
                  <Icon name="X" className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm font-mono text-yellow-900">
                <div><strong>localStorage user:</strong> {localStorage.getItem('user') || 'null'}</div>
                <div><strong>currentUser:</strong> {JSON.stringify(currentUser)}</div>
                <div><strong>currentUser.id:</strong> {currentUser?.id} (тип: {typeof currentUser?.id})</div>
                <div><strong>team.captain_id:</strong> {team?.captain_id} (тип: {typeof team?.captain_id})</div>
                <div><strong>Равны?</strong> {currentUser && team?.captain_id === currentUser.id ? '✅ ДА' : '❌ НЕТ'}</div>
                <div><strong>Кнопка показана?</strong> {currentUser && team?.captain_id === currentUser.id ? '✅ ДА' : '❌ НЕТ'}</div>
              </div>
            </Card>
          )}

          <Card className="p-8 mb-6">
            <div className="flex items-start gap-8">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                {team.logo_url ? (
                  <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Icon name="Shield" className="h-16 w-16 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <TeamLevelBadge level={team.level || 2} size="lg" />
                  <h1 className="text-5xl font-black">{team.name}</h1>
                  {team.tag && <Badge variant="outline" className="text-lg">[{team.tag}]</Badge>}
                  {currentUser && team.captain_id === currentUser.id && (
                    <Button
                      onClick={() => setManageMembersOpen(true)}
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                    >
                      <Icon name="Settings" className="h-4 w-4 mr-2" />
                      Управление составом
                    </Button>
                  )}
                </div>
                
                {team.description && (
                  <p className="text-muted-foreground mb-4">{team.description}</p>
                )}
                
                <div className="grid grid-cols-5 gap-6 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Рейтинг</div>
                    <div className={`text-3xl font-black ${getRatingColor(team.rating)}`}>{team.rating}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Очки</div>
                    <div className="text-3xl font-black text-primary">{team.points || 200}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Побед</div>
                    <div className="text-3xl font-black text-green-500">{team.wins}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Поражений</div>
                    <div className="text-3xl font-black text-red-500">{team.losses}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Винрейт</div>
                    <div className="text-3xl font-black text-primary">{winRate}%</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icon name="Users" className="h-4 w-4" />
                    <span>{members.length} участников</span>
                  </div>
                  {team.created_at && (
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" className="h-4 w-4" />
                      <span>Создана {new Date(team.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="members">
                <Icon name="Users" className="h-4 w-4 mr-2" />
                Состав
              </TabsTrigger>
              <TabsTrigger value="matches">
                <Icon name="Trophy" className="h-4 w-4 mr-2" />
                Матчи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-4">
              <div className="grid gap-4">
                {members.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">В команде пока нет участников</div>
                ) : (
                  members.map((member) => (
                    <Card key={member.id} className="p-6 hover:border-primary transition-colors cursor-pointer" onClick={() => navigate(`/user/${member.user_id}`)}>
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.nickname} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <Icon name="User" className="h-8 w-8 text-primary" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold">{member.nickname}</h3>
                            <Badge variant="default">{member.member_role}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Вступил: {new Date(member.joined_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Icon name="ChevronRight" className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="matches" className="space-y-4">
              <div className="grid gap-4">
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">История матчей пока пуста</div>
                ) : (
                  matches.map((match) => (
                  <Card key={match.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="text-center">
                          <Badge variant={match.result === 'win' ? 'default' : match.result === 'loss' ? 'destructive' : 'secondary'}>
                            {match.result === 'win' ? 'Победа' : match.result === 'loss' ? 'Поражение' : 'Ничья'}
                          </Badge>
                        </div>

                        <div className="flex-1">
                          <div className="text-lg font-bold mb-1">vs {match.opponent}</div>
                          <div className="text-sm text-muted-foreground">{match.tournament}</div>
                        </div>

                        <div className="text-3xl font-black">{match.score}</div>
                        
                        <div className="text-sm text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                  </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {team && (
        <ManageTeamMembersDialog
          open={manageMembersOpen}
          onOpenChange={setManageMembersOpen}
          team={team}
          members={members}
          onSuccess={() => {
            const loadTeam = async () => {
              if (!id) return;
              try {
                const response = await fetch(API_BASE);
                if (!response.ok) throw new Error('Ошибка загрузки команд');
                const data = await response.json();
                const teams = data.teams || [];
                const foundTeam = teams.find((t: Team) => t.id === parseInt(id));
                if (foundTeam) {
                  setTeam(foundTeam);
                  setMembers(foundTeam.members || []);
                }
              } catch (err) {
                console.error('Error loading team:', err);
              }
            };
            loadTeam();
          }}
        />
      )}
    </div>
  );
}