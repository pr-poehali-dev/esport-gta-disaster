import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import BracketHeader from '@/components/tournament-bracket/BracketHeader';
import EmptyBracketPlaceholder from '@/components/tournament-bracket/EmptyBracketPlaceholder';
import BracketRenderer from '@/components/tournament-bracket/BracketRenderer';
import MatchEditDialog from '@/components/tournament-bracket/MatchEditDialog';
import MatchManagementDialog from '@/components/match/MatchManagementDialog';

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

interface Match {
  id: number;
  round: number;
  match_number: number;
  team1: { id: number; name: string; logo_url?: string } | null;
  team2: { id: number; name: string; logo_url?: string } | null;
  winner_id: number | null;
  score_team1: number;
  score_team2: number;
  map_name: string | null;
  scheduled_at: string | null;
  status: string;
}

export default function TournamentBracket() {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [format, setFormat] = useState<string>('single-elimination');
  const [bracketStyle, setBracketStyle] = useState<string>('esports');
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
    loadBracket();
  }, [id]);

  const canEdit = ['founder', 'admin', 'moderator', 'organizer'].includes(userRole);

  const loadBracket = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id || '1'
        },
        body: JSON.stringify({
          action: 'get_bracket',
          tournament_id: id
        })
      });

      const data = await response.json();
      
      if (data.matches) {
        const formattedMatches = data.matches.map((m: any) => ({
          id: m.id,
          round: m.round,
          match_number: m.match_number,
          team1: m.team1_id ? { 
            id: m.team1_id, 
            name: m.team1_name || 'TBD',
            logo_url: m.team1_logo_url 
          } : null,
          team2: m.team2_id ? { 
            id: m.team2_id, 
            name: m.team2_name || 'TBD',
            logo_url: m.team2_logo_url 
          } : null,
          winner_id: m.winner_id,
          score_team1: m.team1_score || 0,
          score_team2: m.team2_score || 0,
          map_name: m.map_name,
          scheduled_at: m.scheduled_at,
          status: m.status
        }));
        setMatches(formattedMatches);
        setFormat(data.format || 'single-elimination');
        setBracketStyle(data.style || 'esports');
      }
    } catch (error) {
      console.error('Ошибка загрузки сетки:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить турнирную сетку',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMatch = async (matchId: number, score1: number, score2: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id
        },
        body: JSON.stringify({
          action: 'update_match_score',
          match_id: matchId,
          team1_score: score1,
          team2_score: score2
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Счет матча обновлен'
        });
        setEditMatch(null);
        loadBracket();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить счет',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить счет матча',
        variant: 'destructive'
      });
    }
  };

  const completeMatch = async (matchId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id
        },
        body: JSON.stringify({
          action: 'complete_match',
          match_id: matchId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Успешно',
          description: 'Матч завершен, победитель продвинут'
        });
        loadBracket();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось завершить матч',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось завершить матч',
        variant: 'destructive'
      });
    }
  };

  const openFullscreen = () => {
    const url = `/tournaments/${id}/bracket/fullscreen`;
    window.open(url, '_blank');
  };

  const getBackgroundClass = () => {
    switch (bracketStyle) {
      case 'esports':
        return 'bg-[#0a0e1a]';
      case 'cyberpunk':
        return 'bg-black';
      case 'minimal':
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50';
      case 'championship':
        return 'bg-[#0a0e1a]';
      case 'gold-deagle':
        return 'bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]';
      default:
        return 'bg-[#0a0e1a]';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${getBackgroundClass()} relative overflow-hidden`}>
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-[98vw] mx-auto px-4">
          <BracketHeader 
            tournamentId={id}
            bracketStyle={bracketStyle}
            onFullscreen={openFullscreen}
          />

          {matches.length === 0 ? (
            <EmptyBracketPlaceholder bracketStyle={bracketStyle} />
          ) : (
            <BracketRenderer
              bracketStyle={bracketStyle}
              matches={matches}
              canEdit={canEdit}
              onMatchClick={(match) => setSelectedMatchId(match.id)}
              onEditMatch={setEditMatch}
            />
          )}
        </div>
      </main>

      <MatchManagementDialog
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
        onUpdate={loadBracket}
      />

      <MatchEditDialog
        match={editMatch}
        onClose={() => setEditMatch(null)}
        onUpdateMatch={updateMatch}
        onCompleteMatch={completeMatch}
      />

      <Footer />
    </div>
  );
}
