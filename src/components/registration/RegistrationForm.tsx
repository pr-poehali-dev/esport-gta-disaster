import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playHoverSound, playSuccessSound } from '@/utils/sounds';

interface Team {
  id: number;
  name: string;
  logo_url: string;
  captain_nickname: string;
  roster: any[];
}

interface RegistrationFormProps {
  team: Team | null;
  user: any;
  onSubmitSuccess: () => void;
}

const RegistrationForm = ({ team, user, onSubmitSuccess }: RegistrationFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    tournament_name: 'Winter Championship 2025',
    discord_contact: '',
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!team) {
      toast({
        title: 'Ошибка',
        description: 'Сначала создайте команду в профиле',
        variant: 'destructive'
      });
      return;
    }

    if (team.roster?.length < 5) {
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
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      playSuccessSound();
      toast({
        title: '✅ Заявка подана!',
        description: 'Ваша заявка отправлена на модерацию',
        className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
      });

      setFormData({
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

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon name="FileText" className="text-primary" size={24} />
          Подать заявку
        </CardTitle>
      </CardHeader>
      <CardContent>
        {team ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{team.logo_url}</div>
                <div>
                  <div className="text-xl font-black">{team.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Капитан: {team.captain_nickname}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Игроков: {team.roster?.length || 0}/7
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">Турнир</label>
              <Input
                value={formData.tournament_name}
                onChange={(e) => setFormData({...formData, tournament_name: e.target.value})}
                className="bg-background/50 border-primary/30"
                required
              />
            </div>

            <div>
              <label className="text-sm font-bold mb-2 block">Discord для связи</label>
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
              disabled={submitting || !team || (team.roster?.length || 0) < 5}
              onMouseEnter={playHoverSound}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              <Icon name="Send" size={18} className="mr-2" />
              {submitting ? 'Отправка...' : 'Подать заявку'}
            </Button>

            {team && (team.roster?.length || 0) < 5 && (
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
