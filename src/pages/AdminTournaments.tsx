import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface Tournament {
  id: number;
  name: string;
  description: string;
  prize_pool: string;
  location: string;
  game_project: string;
  format: string;
  team_size: number;
  best_of: number;
  status: string;
  registration_open: boolean;
  start_date: string | null;
  registered_teams: number;
  is_hidden?: boolean;
}

export default function AdminTournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prize_pool: '',
    location: '',
    game_project: 'GTA 5',
    map_pool: [] as string[],
    format: '5v5',
    team_size: 5,
    best_of: 1,
    start_date: ''
  });

  const [mapInput, setMapInput] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      if (!['admin', 'founder', 'moderator'].includes(userData.role)) {
        showNotification('error', 'Доступ запрещен', 'У вас нет прав администратора');
        navigate('/');
        return;
      }
    } else {
      navigate('/');
      return;
    }

    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const userId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : '');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({ 
          action: 'get_tournaments',
          show_hidden: true
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTournaments(data.tournaments || []);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.map_pool.length === 0) {
      showNotification('error', 'Ошибка', 'Заполните название и добавьте карты');
      return;
    }

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'create_tournament',
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', 'Турнир создан');
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          prize_pool: '',
          location: '',
          game_project: 'GTA 5',
          map_pool: [],
          format: '5v5',
          team_size: 5,
          best_of: 1,
          start_date: ''
        });
        loadTournaments();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleAddMap = () => {
    if (mapInput.trim()) {
      setFormData({
        ...formData,
        map_pool: [...formData.map_pool, mapInput.trim()]
      });
      setMapInput('');
    }
  };

  const handleRemoveMap = (index: number) => {
    setFormData({
      ...formData,
      map_pool: formData.map_pool.filter((_, i) => i !== index)
    });
  };

  const handleUpdateStatus = async (tournamentId: number, newStatus: string) => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'update_tournament_status',
          tournament_id: tournamentId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', 'Статус обновлен');
        loadTournaments();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleToggleVisibility = async (tournamentId: number, currentlyHidden: boolean) => {
    const action = currentlyHidden ? 'показать' : 'скрыть';
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} турнир?`)) return;

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'toggle_tournament_visibility',
          tournament_id: tournamentId,
          is_hidden: !currentlyHidden
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification('success', 'Успех', data.message);
        loadTournaments();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleDeleteTournament = async (tournamentId: number) => {
    if (!confirm('ВНИМАНИЕ! Удалить турнир? Это действие необратимо! Будут удалены все матчи, регистрации и чаты.')) return;

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'delete_tournament',
          tournament_id: tournamentId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification('success', 'Успех', data.message);
        loadTournaments();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleGenerateBracket = async (tournamentId: number) => {
    if (!confirm('Сгенерировать турнирную сетку? Это перезапишет существующую сетку.')) return;

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      console.log('Generating bracket for tournament:', tournamentId);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'generate_bracket',
          tournament_id: tournamentId,
          format: 'single_elimination'
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        showNotification('success', 'Успех', data.message || 'Турнирная сетка сгенерирована');
        loadTournaments();
      } else {
        const errorMsg = data.error || JSON.stringify(data) || 'Не удалось сгенерировать сетку';
        console.error('Error response:', errorMsg);
        showNotification('error', 'Ошибка', errorMsg);
      }
    } catch (error: any) {
      console.error('Exception:', error);
      showNotification('error', 'Ошибка генерации', error?.message || 'Произошла ошибка при генерации турнирной сетки');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      registration: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Регистрация' },
      ongoing: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Идет' },
      completed: { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Завершен' },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Отменен' }
    };

    const badge = badges[status] || badges.registration;
    return (
      <span className={`px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-sm font-bold`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Управление турнирами</h1>
          <p className="text-muted-foreground">Создавайте и управляйте турнирами</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Icon name={showCreateForm ? "X" : "Plus"} className="h-4 w-4 mr-2" />
          {showCreateForm ? 'Отмена' : 'Создать турнир'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Новый турнир</h2>
          <form onSubmit={handleCreateTournament} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Название турнира"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Призовой фонд</label>
                <Input
                  value={formData.prize_pool}
                  onChange={(e) => setFormData({ ...formData, prize_pool: e.target.value })}
                  placeholder="100 000₽"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Место проведения</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Онлайн / Москва"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Проект</label>
                <Input
                  value={formData.game_project}
                  onChange={(e) => setFormData({ ...formData, game_project: e.target.value })}
                  placeholder="GTA 5, SAMP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Формат</label>
                <select
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  value={formData.format}
                  onChange={(e) => {
                    const size = e.target.value === '5v5' ? 5 : e.target.value === '3v3' ? 3 : 1;
                    setFormData({ ...formData, format: e.target.value, team_size: size });
                  }}
                >
                  <option value="5v5">5 на 5</option>
                  <option value="3v3">3 на 3</option>
                  <option value="1v1">1 на 1</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Режим</label>
                <select
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  value={formData.best_of}
                  onChange={(e) => setFormData({ ...formData, best_of: parseInt(e.target.value) })}
                >
                  <option value={1}>Best of 1</option>
                  <option value={3}>Best of 3</option>
                  <option value={5}>Best of 5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Дата начала</label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание турнира"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Пул карт *</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={mapInput}
                  onChange={(e) => setMapInput(e.target.value)}
                  placeholder="Название карты"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMap())}
                />
                <Button type="button" onClick={handleAddMap}>
                  <Icon name="Plus" className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.map_pool.map((map, index) => (
                  <div key={index} className="px-3 py-1 bg-primary/20 rounded-full flex items-center gap-2">
                    <span>{map}</span>
                    <button type="button" onClick={() => handleRemoveMap(index)}>
                      <Icon name="X" className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Icon name="Plus" className="h-4 w-4 mr-2" />
              Создать турнир
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{tournament.name}</h3>
                  {tournament.is_hidden && (
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold">
                      СКРЫТ
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{tournament.description}</p>
              </div>
              {getStatusBadge(tournament.status)}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Призовой</div>
                <div className="font-bold">{tournament.prize_pool || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Формат</div>
                <div className="font-bold">{tournament.format} • BO{tournament.best_of}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Команд</div>
                <div className="font-bold">{tournament.registered_teams}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Место</div>
                <div className="font-bold">{tournament.location || '—'}</div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate(`/admin/tournaments/${tournament.id}/registrations`)}
                className="relative"
              >
                <Icon name="Users" className="h-4 w-4 mr-2" />
                Заявки
                {tournament.registered_teams > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {tournament.registered_teams}
                  </span>
                )}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleGenerateBracket(tournament.id)}
              >
                <Icon name="GitBranch" className="h-4 w-4 mr-2" />
                Сгенерировать сетку
              </Button>
              {tournament.status === 'registration' && (
                <>
                  <Button size="sm" onClick={() => handleUpdateStatus(tournament.id, 'ongoing')}>
                    <Icon name="Play" className="h-4 w-4 mr-2" />
                    Начать турнир
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(tournament.id, 'cancelled')}>
                    <Icon name="X" className="h-4 w-4 mr-2" />
                    Отменить
                  </Button>
                </>
              )}
              {tournament.status === 'ongoing' && (
                <Button size="sm" onClick={() => handleUpdateStatus(tournament.id, 'completed')}>
                  <Icon name="Check" className="h-4 w-4 mr-2" />
                  Завершить турнир
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                <Icon name="Eye" className="h-4 w-4 mr-2" />
                Подробнее
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleToggleVisibility(tournament.id, tournament.is_hidden || false)}
              >
                <Icon name={tournament.is_hidden ? "EyeOff" : "Eye"} className="h-4 w-4 mr-2" />
                {tournament.is_hidden ? 'Показать' : 'Скрыть'}
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleDeleteTournament(tournament.id)}
              >
                <Icon name="Trash2" className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {tournaments.length === 0 && !showCreateForm && (
        <div className="text-center py-20">
          <Icon name="Trophy" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">Нет турниров</h3>
          <p className="text-muted-foreground mb-4">Создайте первый турнир</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Icon name="Plus" className="h-4 w-4 mr-2" />
            Создать турнир
          </Button>
        </div>
      )}
    </div>
  );
}