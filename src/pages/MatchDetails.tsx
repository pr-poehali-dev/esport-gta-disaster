import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';
import MatchChat from '@/components/MatchChat';
import BanPick from '@/components/BanPick';
import { useMatchTimer } from '@/hooks/useMatchTimer';

interface TeamMember {
  id: number;
  nickname: string;
  avatar_url: string | null;
  role: string;
}

interface Team {
  name: string;
  logo_url: string | null;
  captain_id: number;
  color: string;
  members: TeamMember[];
}

interface Match {
  id: number;
  team1_id: number;
  team2_id: number;
  round: number;
  match_order: number;
  team1_score: number;
  team2_score: number;
  status: string;
  match_details: string | null;
  team1_captain_confirmed: boolean;
  team2_captain_confirmed: boolean;
  moderator_verified: boolean;
  completed_at: string | null;
  started_at: string | null;
  referee_id: number | null;
  team1: Team;
  team2: Team;
  referee: {
    id: number;
    nickname: string;
  } | null;
}

interface Screenshot {
  id: number;
  team_id: number;
  screenshot_url: string;
  description: string | null;
  uploaded_at: string;
  uploaded_by_name: string;
  team_name: string;
}

export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const matchTimer = useMatchTimer(match?.started_at || null, 3);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadMatchDetails();
  }, [matchId]);

  const loadMatchDetails = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';
      const response = await fetch(`${API_URL}?match_id=${matchId}`);
      const data = await response.json();
      
      if (response.ok) {
        setMatch(data.match);
        setScreenshots(data.screenshots);
        setTeam1Score(data.match.team1_score);
        setTeam2Score(data.match.team2_score);
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadScreenshot = async (teamId: number) => {
    if (match?.status === 'in_progress' && !matchTimer.canUpload) {
      showNotification('error', 'Ошибка', `Загрузка доступна через ${matchTimer.remainingTime}`);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setUploadingScreenshot(true);
      
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          const API_URL = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';
          const sessionToken = localStorage.getItem('sessionToken');
          
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Session-Token': sessionToken || ''
            },
            body: JSON.stringify({
              action: 'upload_screenshot',
              match_id: matchId,
              team_id: teamId,
              image: event.target.result
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            showNotification('success', 'Успех', 'Скриншот загружен');
            loadMatchDetails();
          } else {
            showNotification('error', 'Ошибка', data.error);
          }
        } catch (error: any) {
          showNotification('error', 'Ошибка', error.message);
        } finally {
          setUploadingScreenshot(false);
        }
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  const handleUpdateScore = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';
      const sessionToken = localStorage.getItem('sessionToken');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken || ''
        },
        body: JSON.stringify({
          action: 'update_score',
          match_id: matchId,
          team1_score: team1Score,
          team2_score: team2Score
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', 'Успех', 'Счет обновлен');
        loadMatchDetails();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleConfirmResult = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';
      const sessionToken = localStorage.getItem('sessionToken');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken || ''
        },
        body: JSON.stringify({
          action: 'confirm_result',
          match_id: matchId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', 'Успех', data.both_confirmed ? 'Матч завершен!' : 'Результат подтвержден');
        loadMatchDetails();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleNullifyMatch = async () => {
    if (!confirm('Вы уверены, что хотите аннулировать результат этого матча?')) return;
    
    try {
      const API_URL = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';
      const sessionToken = localStorage.getItem('sessionToken');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken || ''
        },
        body: JSON.stringify({
          action: 'nullify_match',
          match_id: matchId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', 'Успех', 'Матч аннулирован');
        loadMatchDetails();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Матч не найден</h2>
        <Button onClick={() => navigate('/tournaments')}>
          <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Назад к турнирам
        </Button>
      </div>
    );
  }

  const isCaptain1 = user?.id === match.team1.captain_id;
  const isCaptain2 = user?.id === match.team2.captain_id;
  const isCaptain = isCaptain1 || isCaptain2;
  const isReferee = user?.id === match.referee_id;
  const isModerator = user && ['moderator', 'admin', 'founder'].includes(user.role);
  const canUpload1 = isCaptain1 && screenshots.filter(s => s.team_id === match.team1_id).length < 5;
  const canUpload2 = isCaptain2 && screenshots.filter(s => s.team_id === match.team2_id).length < 5;

  const getStatusBadge = () => {
    switch (match.status) {
      case 'pending': return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-bold">Ожидание</span>;
      case 'in_progress': return <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-sm font-bold">В процессе</span>;
      case 'completed': return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm font-bold">Завершен</span>;
      case 'disputed': return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm font-bold">Спор</span>;
      case 'nullified': return <span className="px-3 py-1 rounded-full bg-gray-500/20 text-gray-500 text-sm font-bold">Аннулирован</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Назад
        </Button>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card 
          className="p-6 border-2 transition-all hover:shadow-xl"
          style={{ borderColor: match.team1.color }}
        >
          <div className="text-center mb-6">
            {match.team1.logo_url && (
              <img 
                src={match.team1.logo_url} 
                alt={match.team1.name} 
                className="w-24 h-24 mx-auto mb-4 rounded-full object-cover ring-4"
                style={{ ringColor: match.team1.color }}
              />
            )}
            <h2 className="text-2xl font-black mb-2" style={{ color: match.team1.color }}>
              {match.team1.name}
            </h2>
            {match.team1_captain_confirmed && (
              <div className="flex items-center justify-center gap-2 text-green-500 text-sm">
                <Icon name="CheckCircle" className="h-4 w-4" />
                <span>Результат подтвержден</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-sm uppercase text-muted-foreground mb-3">Состав команды</h3>
            {match.team1.members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer"
                onClick={() => navigate(`/user/${member.id}`)}
              >
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.nickname} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="User" className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-bold">{member.nickname}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
                {member.id === match.team1.captain_id && (
                  <Icon name="Crown" className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            ))}
          </div>

          {canUpload1 && match.status !== 'completed' && match.status !== 'nullified' && (
            <Button 
              className="w-full"
              onClick={() => handleUploadScreenshot(match.team1_id)}
              disabled={uploadingScreenshot}
              style={{ backgroundColor: match.team1.color }}
            >
              <Icon name="Upload" className="h-4 w-4 mr-2" />
              Загрузить скриншот ({screenshots.filter(s => s.team_id === match.team1_id).length}/5)
            </Button>
          )}
        </Card>

        <Card className="p-8 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
          <div className="text-center mb-6">
            <h1 className="text-8xl font-black mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {team1Score} : {team2Score}
            </h1>
            <p className="text-muted-foreground">Раунд {match.round}</p>
            
            {match.status === 'in_progress' && match.started_at && (
              <div className="mt-4 p-4 rounded-lg bg-background">
                <div className="text-sm text-muted-foreground mb-2">Время матча</div>
                <div className="text-3xl font-black">{matchTimer.formattedTime}</div>
                
                {!matchTimer.canUpload && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      До загрузки результатов: {matchTimer.remainingTime}
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${matchTimer.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {matchTimer.canUpload && (
                  <div className="text-sm text-green-500 mt-2">
                    <Icon name="CheckCircle" className="h-4 w-4 inline mr-1" />
                    Можно загружать результаты
                  </div>
                )}
              </div>
            )}
          </div>

          {(isCaptain || isModerator || isReferee) && match.status !== 'completed' && match.status !== 'nullified' && (
            <div className="w-full space-y-4 mb-6">
              <div className="flex gap-2 items-center justify-center">
                <Input 
                  type="number" 
                  value={team1Score} 
                  onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                  className="w-20 text-center text-2xl font-bold"
                />
                <span className="text-2xl font-bold">:</span>
                <Input 
                  type="number" 
                  value={team2Score} 
                  onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                  className="w-20 text-center text-2xl font-bold"
                />
              </div>
              <Button className="w-full" onClick={handleUpdateScore}>
                <Icon name="Save" className="h-4 w-4 mr-2" />
                Обновить счет
              </Button>
            </div>
          )}

          {isCaptain && match.status !== 'completed' && match.status !== 'nullified' && (
            <Button className="w-full mb-4" variant="default" onClick={handleConfirmResult}>
              <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
              Подтвердить результат
            </Button>
          )}

          {match.referee && (
            <Card className="w-full p-4 bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Icon name="Gavel" className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Судья матча</div>
                  <div 
                    className="font-bold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/user/${match.referee?.id}`)}
                  >
                    {match.referee.nickname}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {(isReferee || isModerator) && match.status !== 'nullified' && (
            <Button 
              className="w-full mt-4" 
              variant="destructive" 
              onClick={handleNullifyMatch}
            >
              <Icon name="XCircle" className="h-4 w-4 mr-2" />
              Аннулировать матч
            </Button>
          )}

          {screenshots.length > 0 && (
            <div className="w-full mt-6">
              <h3 className="font-bold text-sm uppercase text-muted-foreground mb-3 text-center">
                Скриншоты ({screenshots.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {screenshots.slice(0, 4).map((screenshot) => (
                  <img 
                    key={screenshot.id}
                    src={screenshot.screenshot_url} 
                    alt="Screenshot" 
                    className="w-full aspect-video object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => window.open(screenshot.screenshot_url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card 
          className="p-6 border-2 transition-all hover:shadow-xl"
          style={{ borderColor: match.team2.color }}
        >
          <div className="text-center mb-6">
            {match.team2.logo_url && (
              <img 
                src={match.team2.logo_url} 
                alt={match.team2.name} 
                className="w-24 h-24 mx-auto mb-4 rounded-full object-cover ring-4"
                style={{ ringColor: match.team2.color }}
              />
            )}
            <h2 className="text-2xl font-black mb-2" style={{ color: match.team2.color }}>
              {match.team2.name}
            </h2>
            {match.team2_captain_confirmed && (
              <div className="flex items-center justify-center gap-2 text-green-500 text-sm">
                <Icon name="CheckCircle" className="h-4 w-4" />
                <span>Результат подтвержден</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-sm uppercase text-muted-foreground mb-3">Состав команды</h3>
            {match.team2.members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer"
                onClick={() => navigate(`/user/${member.id}`)}
              >
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.nickname} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="User" className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-bold">{member.nickname}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
                {member.id === match.team2.captain_id && (
                  <Icon name="Crown" className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            ))}
          </div>

          {canUpload2 && match.status !== 'completed' && match.status !== 'nullified' && (
            <Button 
              className="w-full"
              onClick={() => handleUploadScreenshot(match.team2_id)}
              disabled={uploadingScreenshot}
              style={{ backgroundColor: match.team2.color }}
            >
              <Icon name="Upload" className="h-4 w-4 mr-2" />
              Загрузить скриншот ({screenshots.filter(s => s.team_id === match.team2_id).length}/5)
            </Button>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <BanPick 
          matchId={matchId || ''} 
          teamId={isCaptain1 ? match.team1_id : isCaptain2 ? match.team2_id : null}
          isCaptain={isCaptain}
        />
        <MatchChat matchId={matchId || ''} />
      </div>
    </div>
  );
}