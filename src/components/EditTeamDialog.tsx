import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { playClickSound, playSuccessSound } from '@/utils/sounds';
import { useToast } from '@/hooks/use-toast';

const LOGO_OPTIONS = [
  { emoji: '🦁', name: 'Лев' },
  { emoji: '🐺', name: 'Волк' },
  { emoji: '🐉', name: 'Дракон' },
  { emoji: '⚡', name: 'Молния' },
  { emoji: '🔥', name: 'Огонь' },
  { emoji: '💎', name: 'Алмаз' },
  { emoji: '👑', name: 'Корона' },
  { emoji: '⚔️', name: 'Мечи' },
  { emoji: '🛡️', name: 'Щит' },
  { emoji: '🎯', name: 'Мишень' },
  { emoji: '💀', name: 'Череп' },
  { emoji: '🦅', name: 'Орёл' },
];

interface EditTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: any;
  onSuccess: () => void;
}

export default function EditTeamDialog({ open, onOpenChange, team, onSuccess }: EditTeamDialogProps) {
  const { toast } = useToast();
  const [teamName, setTeamName] = useState('');
  const [selectedLogo, setSelectedLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (team) {
      setTeamName(team.name || '');
      setSelectedLogo(team.logo_url || LOGO_OPTIONS[0].emoji);
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!teamName.trim()) {
      setError('Введите название команды');
      return;
    }

    setLoading(true);
    playClickSound();

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          name: teamName.trim(),
          logo_url: selectedLogo
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка обновления команды');
      }

      playSuccessSound();
      toast({
        title: "✅ Команда обновлена!",
        description: "Изменения успешно сохранены",
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления команды');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-primary/30 bg-card/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Icon name="Edit" size={24} className="text-primary" />
            Редактирование команды
          </DialogTitle>
          <DialogDescription>
            Измените название команды или логотип
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="teamName">Название команды</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Введите название..."
              maxLength={50}
              className="border-primary/30"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Логотип команды</Label>
            <div className="grid grid-cols-6 gap-2">
              {LOGO_OPTIONS.map((logo) => (
                <button
                  key={logo.emoji}
                  type="button"
                  onClick={() => {
                    setSelectedLogo(logo.emoji);
                    playClickSound();
                  }}
                  className={`
                    p-3 text-3xl rounded-lg border-2 transition-all
                    hover:scale-110 hover:shadow-lg
                    ${selectedLogo === logo.emoji 
                      ? 'border-primary bg-primary/20 shadow-primary/50' 
                      : 'border-border bg-card/50 hover:border-primary/50'
                    }
                  `}
                  title={logo.name}
                  disabled={loading}
                >
                  {logo.emoji}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-destructive text-sm flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                playClickSound();
                onOpenChange(false);
              }}
              disabled={loading}
              className="border-primary/30"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || !teamName.trim()}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
