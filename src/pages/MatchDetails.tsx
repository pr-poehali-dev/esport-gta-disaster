import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

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
  team1: {
    name: string;
    logo_url: string | null;
    captain_id: number;
  };
  team2: {
    name: string;
    logo_url: string | null;
    captain_id: number;
  };
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

  const handleModerateMatch = async (action: string, winnerId?: number) => {
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
          action: 'moderate_match',
          match_id: matchId,
          moderator_action: action,
          winner_id: winnerId
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showNotification('success', 'Успех', 'Действие выполнено');
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
  const isModerator = user && ['moderator', 'admin', 'founder'].includes(user.role);
  const canUpload1 = isCaptain1 && screenshots.filter(s => s.team_id === match.team1_id).length < 5;
  const canUpload2 = isCaptain2 && screenshots.filter(s => s.team_id === match.team2_id).length < 5;

  const getStatusBadge = () => {
    switch (match.status) {
      case 'pending': return <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-sm">Ожидание</span>;
      case 'in_progress': return <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-sm">В процессе</span>;
      case 'completed': return <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm">Завершен</span>;
      case 'disputed': return <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm">Спор</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black">Детали матча</h1>
          {getStatusBadge()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="p-6 text-center">
            {match.team1.logo_url && (
              <img src={match.team1.logo_url} alt={match.team1.name} className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
            )}
            <h3 className="text-xl font-bold mb-2">{match.team1.name}</h3>
            {match.team1_captain_confirmed && (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Icon name="Check" className="h-4 w-4" />
                <span className="text-sm">Подтверждено</span>
              </div>
            )}
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center bg-primary/10">
            <div className="text-6xl font-black mb-4">
              {team1Score} : {team2Score}
            </div>
            {(isCaptain || isModerator) && match.status !== 'completed' && (
              <div className="flex gap-2 items-center">
                <Input 
                  type="number" 
                  value={team1Score} 
                  onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                />
                <span>:</span>
                <Input 
                  type="number" 
                  value={team2Score} 
                  onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                />
                <Button size="sm" onClick={handleUpdateScore}>
                  Обновить
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6 text-center">
            {match.team2.logo_url && (
              <img src={match.team2.logo_url} alt={match.team2.name} className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
            )}
            <h3 className="text-xl font-bold mb-2">{match.team2.name}</h3>
            {match.team2_captain_confirmed && (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Icon name="Check" className="h-4 w-4" />
                <span className="text-sm">Подтверждено</span>
              </div>
            )}
          </Card>
        </div>

        {isCaptain && match.status !== 'completed' && (
          <div className="flex justify-center mb-6">
            <Button onClick={handleConfirmResult}>
              <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
              Подтвердить результат
            </Button>
          </div>
        )}

        {isModerator && (
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/30 mb-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Icon name="Shield" className="h-5 w-5" />
              Модерация
            </h3>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => handleModerateMatch('verify')}>
                Подтвердить матч
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleModerateMatch('dispute')}>
                Открыть спор
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleModerateMatch('force_complete', match.team1_id)}>
                Победа {match.team1.name}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleModerateMatch('force_complete', match.team2_id)}>
                Победа {match.team2.name}
              </Button>
            </div>
          </Card>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Скриншоты {match.team1.name}</h3>
            {canUpload1 && (
              <Button size="sm" onClick={() => handleUploadScreenshot(match.team1_id)} disabled={uploadingScreenshot}>
                <Icon name="Upload" className="h-4 w-4 mr-2" />
                Загрузить
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {screenshots.filter(s => s.team_id === match.team1_id).map((screenshot) => (
              <Card key={screenshot.id} className="p-4">
                <img src={screenshot.screenshot_url} alt="Screenshot" className="w-full rounded mb-2" />
                <p className="text-sm text-muted-foreground">
                  {screenshot.uploaded_by_name} • {new Date(screenshot.uploaded_at).toLocaleString('ru-RU')}
                </p>
                {screenshot.description && (
                  <p className="text-sm mt-2">{screenshot.description}</p>
                )}
              </Card>
            ))}
            {screenshots.filter(s => s.team_id === match.team1_id).length === 0 && (
              <p className="text-muted-foreground text-center py-8">Нет скриншотов</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Скриншоты {match.team2.name}</h3>
            {canUpload2 && (
              <Button size="sm" onClick={() => handleUploadScreenshot(match.team2_id)} disabled={uploadingScreenshot}>
                <Icon name="Upload" className="h-4 w-4 mr-2" />
                Загрузить
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {screenshots.filter(s => s.team_id === match.team2_id).map((screenshot) => (
              <Card key={screenshot.id} className="p-4">
                <img src={screenshot.screenshot_url} alt="Screenshot" className="w-full rounded mb-2" />
                <p className="text-sm text-muted-foreground">
                  {screenshot.uploaded_by_name} • {new Date(screenshot.uploaded_at).toLocaleString('ru-RU')}
                </p>
                {screenshot.description && (
                  <p className="text-sm mt-2">{screenshot.description}</p>
                )}
              </Card>
            ))}
            {screenshots.filter(s => s.team_id === match.team2_id).length === 0 && (
              <p className="text-muted-foreground text-center py-8">Нет скриншотов</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
