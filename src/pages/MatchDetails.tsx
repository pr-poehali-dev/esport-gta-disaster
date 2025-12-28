import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';
import MatchChat from '@/components/MatchChat';
import BanPick from '@/components/BanPick';
import { useMatchTimer } from '@/hooks/useMatchTimer';
import MatchHeader from '@/components/match/MatchHeader';
import MatchTeamRosters from '@/components/match/MatchTeamRosters';
import MatchControls from '@/components/match/MatchControls';
import MatchScreenshots from '@/components/match/MatchScreenshots';

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

  const handleUpdateScore = async (team1Score: number, team2Score: number) => {
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
  const isReferee = user?.id === match.referee?.id;
  const isModerator = user && ['moderator', 'admin', 'founder'].includes(user.role);

  return (
    <div className="space-y-6 pb-12">
      <Button onClick={() => navigate('/tournaments')} variant="outline">
        <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
        Назад к турнирам
      </Button>

      <MatchHeader
        team1={match.team1}
        team2={match.team2}
        team1Score={match.team1_score}
        team2Score={match.team2_score}
        status={match.status}
        round={match.round}
        matchOrder={match.match_order}
        referee={match.referee}
      />

      <MatchTeamRosters team1={match.team1} team2={match.team2} />

      {(isCaptain1 || isCaptain2 || isModerator || isReferee) && (
        <MatchControls
          matchId={matchId}
          team1Id={match.team1_id}
          team2Id={match.team2_id}
          initialTeam1Score={match.team1_score}
          initialTeam2Score={match.team2_score}
          team1CaptainConfirmed={match.team1_captain_confirmed}
          team2CaptainConfirmed={match.team2_captain_confirmed}
          isCaptain1={isCaptain1}
          isCaptain2={isCaptain2}
          isReferee={isReferee}
          isModerator={isModerator}
          canUpload={matchTimer.canUpload}
          remainingTime={matchTimer.remainingTime}
          uploadingScreenshot={uploadingScreenshot}
          onUploadScreenshot={handleUploadScreenshot}
          onUpdateScore={handleUpdateScore}
          onConfirmResult={handleConfirmResult}
          onNullifyMatch={handleNullifyMatch}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matchId && <BanPick matchId={parseInt(matchId)} />}
        {matchId && <MatchChat matchId={parseInt(matchId)} />}
      </div>

      <MatchScreenshots screenshots={screenshots} />
    </div>
  );
}
