import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playSuccessSound } from '@/utils/sounds';

interface TeamManagementProps {
  teamId: number;
  onUpdate: () => void;
}

export default function TeamManagement({ teamId, onUpdate }: TeamManagementProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mainPlayers, setMainPlayers] = useState<string[]>(['', '', '', '', '']);
  const [reservePlayers, setReservePlayers] = useState<string[]>(['', '']);
  const [existingRoster, setExistingRoster] = useState<any[]>([]);

  useEffect(() => {
    loadRoster();
  }, [teamId]);

  const loadRoster = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0?action=roster', {
        headers: { 'X-User-Id': user.id?.toString() || '' }
      });

      if (response.ok) {
        const data = await response.json();
        const mainList = data.filter((p: any) => p.player_role === 'main').map((p: any) => p.player_nickname || '');
        const reserveList = data.filter((p: any) => p.player_role === 'reserve').map((p: any) => p.player_nickname || '');
        
        while (mainList.length < 5) mainList.push('');
        while (reserveList.length < 2) reserveList.push('');
        
        setMainPlayers(mainList);
        setReservePlayers(reserveList);
        setExistingRoster(data);
      }
    } catch (error) {
      console.log('Failed to load roster');
    }
  };

  const handleSave = async () => {
    playClickSound();
    setLoading(true);

    const filledMainPlayers = mainPlayers.filter(p => p.trim());
    const filledReservePlayers = reservePlayers.filter(p => p.trim());

    if (filledMainPlayers.length === 0) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одного основного игрока",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const allNicknames = [...filledMainPlayers, ...filledReservePlayers];
    const uniqueNicknames = new Set(allNicknames.map(n => n.toLowerCase()));
    
    if (uniqueNicknames.size !== allNicknames.length) {
      toast({
        title: "Ошибка",
        description: "Обнаружены повторяющиеся никнеймы",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('https://functions.poehali.dev/c8cfc7ef-3e1a-4fa4-ad8e-70777d50b4f0?action=roster', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          main_players: mainPlayers,
          reserve_players: reservePlayers
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка сохранения состава');
      }

      playSuccessSound();
      toast({
        title: "✅ Состав обновлен!",
        description: "Изменения успешно сохранены",
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      onUpdate();
      loadRoster();
    } catch (err) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : 'Не удалось сохранить состав',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={24} className="text-primary" />
          Управление составом команды
        </CardTitle>
        <CardDescription>
          Добавьте никнеймы игроков: до 5 основных и 2 запасных. Никнеймы должны быть уникальными.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-sm font-bold">
              5
            </div>
            <Label className="text-lg font-bold">Основной состав</Label>
          </div>
          
          {mainPlayers.map((player, index) => (
            <div key={`main-${index}`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                {index + 1}
              </div>
              <Input
                value={player}
                onChange={(e) => {
                  const newPlayers = [...mainPlayers];
                  newPlayers[index] = e.target.value;
                  setMainPlayers(newPlayers);
                }}
                placeholder={`Игрок ${index + 1}`}
                className="flex-1 border-primary/30"
                disabled={loading}
              />
            </div>
          ))}
        </div>

        <div className="border-t border-primary/20 pt-6 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <Label className="text-lg font-bold">Запасные игроки</Label>
          </div>
          
          {reservePlayers.map((player, index) => (
            <div key={`reserve-${index}`} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center text-sm font-bold text-yellow-500">
                R{index + 1}
              </div>
              <Input
                value={player}
                onChange={(e) => {
                  const newPlayers = [...reservePlayers];
                  newPlayers[index] = e.target.value;
                  setReservePlayers(newPlayers);
                }}
                placeholder={`Запасной ${index + 1}`}
                className="flex-1 border-yellow-500/30"
                disabled={loading}
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-primary/20">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Icon name="Save" size={18} className="mr-2" />
                Сохранить состав
              </>
            )}
          </Button>
        </div>

        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex gap-2 text-sm text-blue-300">
            <Icon name="Info" size={16} className="mt-0.5" />
            <div>
              <div className="font-bold mb-1">Важно:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Никнеймы не должны совпадать с зарегистрированными пользователями</li>
                <li>Все никнеймы в команде должны быть уникальными</li>
                <li>Можно указать от 1 до 5 основных игроков</li>
                <li>Запасные игроки необязательны</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
