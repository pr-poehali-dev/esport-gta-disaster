import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ADMIN_API = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function AdminTournamentsSection() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [registrationsDialogOpen, setRegistrationsDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prize_pool: '',
    location: '',
    game_project: 'GTA V',
    format: 'single-elimination',
    team_size: '5',
    best_of: '1',
    start_date: '',
    max_participants: '16',
    image: null as File | null,
  });

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id,
        },
        body: JSON.stringify({ action: 'get_tournaments' }),
      });

      const data = await response.json();
      if (data.tournaments) {
        setTournaments(data.tournaments);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить турниры',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTournament = async (tournamentId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот турнир?')) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id,
        },
        body: JSON.stringify({
          action: 'delete_tournament',
          tournament_id: tournamentId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Успешно', description: data.message });
        loadTournaments();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить турнир',
        variant: 'destructive',
      });
    }
  };

  const handleHideTournament = async (tournamentId: number, isHidden: boolean) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id,
        },
        body: JSON.stringify({
          action: 'hide_tournament',
          tournament_id: tournamentId,
          is_hidden: !isHidden,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Успешно', description: data.message });
        loadTournaments();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить видимость турнира',
        variant: 'destructive',
      });
    }
  };

  const handleStartTournament = async (tournamentId: number) => {
    if (!confirm('Начать турнир и сгенерировать сетку? Это действие нельзя отменить.')) return;

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id,
        },
        body: JSON.stringify({
          action: 'start_tournament',
          tournament_id: tournamentId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Успешно', description: data.message });
        loadTournaments();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось начать турнир',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTournament = async () => {
    if (!formData.name || !formData.start_date) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      let imageBase64 = '';
      if (formData.image) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = reader.result?.toString().split(',')[1] || '';
            resolve(base64);
          };
          reader.readAsDataURL(formData.image!);
        });
      }

      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id,
        },
        body: JSON.stringify({
          action: 'create_tournament',
          ...formData,
          image: imageBase64,
          max_participants: parseInt(formData.max_participants),
          team_size: parseInt(formData.team_size),
          best_of: parseInt(formData.best_of),
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Успешно', description: 'Турнир создан' });
        setCreateDialogOpen(false);
        loadTournaments();
        setFormData({
          name: '',
          description: '',
          prize_pool: '',
          location: '',
          game_project: 'GTA V',
          format: 'single-elimination',
          team_size: '5',
          best_of: '1',
          start_date: '',
          max_participants: '16',
          image: null,
        });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать турнир',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-500';
      case 'completed':
        return 'bg-gray-500/20 text-gray-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Турнирами</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Icon name="Plus" size={20} className="mr-2" />
          Создать турнир
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Название</th>
                <th className="text-left p-4 font-semibold">Статус</th>
                <th className="text-left p-4 font-semibold">Участники</th>
                <th className="text-left p-4 font-semibold">Призовой фонд</th>
                <th className="text-left p-4 font-semibold">Видимость</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 font-medium">{tournament.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(tournament.status)}`}>
                      {tournament.status === 'active' && 'Активен'}
                      {tournament.status === 'upcoming' && 'Ожидание'}
                      {tournament.status === 'completed' && 'Завершен'}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {tournament.registrations_count}/{tournament.max_participants}
                  </td>
                  <td className="p-4 font-semibold">{tournament.prize_pool || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${tournament.is_hidden ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                      {tournament.is_hidden ? 'Скрыт' : 'Показан'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {!tournament.is_started && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStartTournament(tournament.id)}
                          title="Начать турнир"
                        >
                          <Icon name="Play" size={16} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(`/tournaments/${tournament.id}/bracket`, '_blank')}
                        title="Турнирная сетка"
                      >
                        <Icon name="GitBranch" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setRegistrationsDialogOpen(true);
                        }}
                        title="Заявки"
                      >
                        <Icon name="Users" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleHideTournament(tournament.id, tournament.is_hidden)}
                        title={tournament.is_hidden ? 'Показать' : 'Скрыть'}
                      >
                        <Icon name={tournament.is_hidden ? 'Eye' : 'EyeOff'} size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTournament(tournament.id)}
                        title="Удалить"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать турнир</DialogTitle>
            <DialogDescription>Заполните информацию о новом турнире</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Название турнира *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="GTA V Championship 2025"
              />
            </div>

            <div>
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание турнира..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Призовой фонд</Label>
                <Input
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                  placeholder="500,000₽"
                />
              </div>

              <div>
                <Label>Локация</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Online / Москва"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Дата начала *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <Label>Макс. участников</Label>
                <Select
                  value={formData.max_participants}
                  onValueChange={(value) => setFormData({ ...formData, max_participants: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">16 (1/16)</SelectItem>
                    <SelectItem value="32">32 (1/32)</SelectItem>
                    <SelectItem value="64">64 (1/64)</SelectItem>
                    <SelectItem value="128">128 (1/128)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Изображение турнира</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
              />
            </div>

            <Button onClick={handleCreateTournament} disabled={loading} className="w-full">
              {loading ? 'Создание...' : 'Создать турнир'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}