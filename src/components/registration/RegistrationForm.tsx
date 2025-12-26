import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playHoverSound, playSuccessSound } from '@/utils/sounds';

interface Team {
  id: number;
  name: string;
  logo_url: string;
  captain_nickname: string;
  roster: any[];
  member_count: number;
  is_captain: boolean;
}

interface RegistrationFormProps {
  user: any;
  onSubmitSuccess: () => void;
}

const RegistrationForm = ({ user, onSubmitSuccess }: RegistrationFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  
  const [formData, setFormData] = useState({
    team_id: '',
    tournament_name: 'Winter Championship 2025',
    discord_contact: '',
    comment: ''
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53?action=teams', {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const selectedTeam = teams.find(t => t.id === parseInt(formData.team_id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.team_id) {
      toast({
        title: 'Ошибка',
        description: 'Выберите команду',
        variant: 'destructive'
      });
      return;
    }

    if (selectedTeam && selectedTeam.member_count < 5) {
      toast({
        title: 'Ошибка',
        description: 'В команде должно быть минимум 5 игроков',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    playClickSound();

    try {
      const response = await fetch('https://functions.poehali.dev/d2f5f9df-8162-4cb4-a2c4-6caf7e492d53', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          team_id: parseInt(formData.team_id),
          tournament_name: formData.tournament_name,
          discord_contact: formData.discord_contact,
          comment: formData.comment
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при подаче заявки');
      }

      playSuccessSound();
      toast({
        title: '✅ Заявка подана!',
        description: 'Ваша заявка отправлена на модерацию',
        className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
      });

      setFormData({
        team_id: '',
        tournament_name: 'Winter Championship 2025',
        discord_contact: '',
        comment: ''
      });

      onSubmitSuccess();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось подать заявку',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTeams) {
    return (
      <Card className="border-primary/30 bg-card/80 backdrop-blur">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Загрузка команд...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon name="FileText" className="text-primary" size={24} />
          Подать заявку
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teams.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-2 block">Выберите команду *</label>
              <Select value={formData.team_id} onValueChange={(value) => setFormData({...formData, team_id: value})}>
                <SelectTrigger className="bg-background/50 border-primary/30">
                  <SelectValue placeholder="Выберите команду..." />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{team.logo_url}</span>
                        <span>{team.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({team.member_count} игроков)
                        </span>
                        {team.is_captain && (
                          <span className="text-xs text-yellow-500">👑 Капитан</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTeam && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{selectedTeam.logo_url}</div>
                  <div>
                    <div className="text-xl font-black">{selectedTeam.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Капитан: {selectedTeam.captain_nickname}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Игроков: {selectedTeam.member_count}/7
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-bold mb-2 block">Турнир *</label>
              <Input
                value={formData.tournament_name}
                onChange={(e) => setFormData({...formData, tournament_name: e.target.value})}
                className="bg-background/50 border-primary/30"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">Discord для связи *</label>
              <Input
                value={formData.discord_contact}
                onChange={(e) => setFormData({...formData, discord_contact: e.target.value})}
                placeholder="username#1234"
                className="bg-background/50 border-primary/30"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">Комментарий (необязательно)</label>
              <Textarea
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                placeholder="Дополнительная информация о команде..."
                className="bg-background/50 border-primary/30 min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !formData.team_id || (selectedTeam && selectedTeam.member_count < 5)}
              onMouseEnter={playHoverSound}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              <Icon name="Send" size={18} className="mr-2" />
              {submitting ? 'Отправка...' : 'Подать заявку'}
            </Button>

            {selectedTeam && selectedTeam.member_count < 5 && (
              <div className="text-sm text-yellow-500 text-center">
                ⚠️ Для регистрации необходимо минимум 5 игроков в составе
              </div>
            )}
          </form>
        ) : (
          <div className="text-center py-8">
            <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
            <p className="text-muted-foreground mb-4">У вас нет команды</p>
            <Button
              onClick={() => navigate('/profile')}
              onMouseEnter={playHoverSound}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Создать команду
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationForm;
