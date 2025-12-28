import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const TEAMS_API = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';

export default function CreateTeam() {
  const [teamName, setTeamName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const searchPlayers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search_users', query }),
      });

      const data = await response.json();
      if (data.users) {
        setSearchResults(data.users.filter((u: any) => u.id !== user.id));
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  };

  const addPlayer = (player: any, role: 'main' | 'reserve') => {
    if (selectedPlayers.length >= 6) {
      toast({ title: 'Ошибка', description: 'Максимум 6 дополнительных игроков', variant: 'destructive' });
      return;
    }
    
    if (selectedPlayers.find(p => p.id === player.id)) {
      toast({ title: 'Ошибка', description: 'Игрок уже добавлен', variant: 'destructive' });
      return;
    }

    setSelectedPlayers([...selectedPlayers, { ...player, role }]);
    setPlayerSearch('');
    setSearchResults([]);
  };

  const removePlayer = (playerId: number) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const handleCreate = async () => {
    if (!teamName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название команды', variant: 'destructive' });
      return;
    }

    const mainPlayers = selectedPlayers.filter(p => p.role === 'main');
    const reservePlayers = selectedPlayers.filter(p => p.role === 'reserve');

    if (mainPlayers.length + 1 < 5) {
      toast({ title: 'Ошибка', description: 'Минимум 5 основных игроков (включая капитана)', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'create_team',
          name: teamName,
          tag,
          description,
          players: selectedPlayers.map(p => ({ user_id: p.id, role: p.role })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: 'Успешно!', description: data.message });
        navigate('/teams');
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось создать команду', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" size={28} />
              Создание команды
            </CardTitle>
            <CardDescription>
              Заполните данные и пригласите до 6 игроков (4 основных + 2 запасных)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Название команды *</Label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Введите название..."
                  maxLength={50}
                />
              </div>

              <div>
                <Label>Тег команды</Label>
                <Input
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toUpperCase())}
                  placeholder="TAG"
                  maxLength={5}
                />
              </div>

              <div>
                <Label>Описание</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Расскажите о команде..."
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Состав команды</h3>
              
              <div className="mb-4 p-3 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <Icon name="Crown" size={18} className="text-yellow-500" />
                  <span className="font-medium">{user.nickname || 'Вы'}</span>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Капитан (Основной)</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {selectedPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {player.avatar_url && (
                        <img src={player.avatar_url} alt={player.nickname} className="w-8 h-8 rounded-full" />
                      )}
                      <span className="font-medium">{player.nickname}</span>
                      <span className={`text-xs px-2 py-1 rounded ${player.role === 'main' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                        {player.role === 'main' ? 'Основной' : 'Запасной'}
                      </span>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removePlayer(player.id)}>
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <Label>Поиск игроков по никнейму</Label>
                <Input
                  value={playerSearch}
                  onChange={(e) => {
                    setPlayerSearch(e.target.value);
                    searchPlayers(e.target.value);
                  }}
                  placeholder="Начните вводить никнейм..."
                />
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((player) => (
                      <div
                        key={player.id}
                        className="p-3 hover:bg-muted cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {player.avatar_url && (
                            <img src={player.avatar_url} alt={player.nickname} className="w-8 h-8 rounded-full" />
                          )}
                          <span>{player.nickname}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => addPlayer(player, 'main')}
                            disabled={selectedPlayers.filter(p => p.role === 'main').length >= 4}
                          >
                            Основной
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addPlayer(player, 'reserve')}
                            disabled={selectedPlayers.filter(p => p.role === 'reserve').length >= 2}
                          >
                            Запасной
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                Основных игроков: {selectedPlayers.filter(p => p.role === 'main').length + 1}/5 • 
                Запасных: {selectedPlayers.filter(p => p.role === 'reserve').length}/2
              </p>
            </div>

            <Button onClick={handleCreate} disabled={loading} className="w-full" size="lg">
              <Icon name="Check" size={18} className="mr-2" />
              {loading ? 'Создание...' : 'Создать команду'}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
