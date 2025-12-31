import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';
import TournamentCard from '@/components/admin/TournamentCard';
import CreateTournamentForm from '@/components/admin/CreateTournamentForm';

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
        showNotification('success', 'Успех', data.message || 'Турнирная сетка создана');
        loadTournaments();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось создать сетку');
      }
    } catch (error: any) {
      console.error('Error generating bracket:', error);
      showNotification('error', 'Ошибка', error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Управление турнирами</h1>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Icon name={showCreateForm ? "X" : "Plus"} size={16} className="mr-2" />
              {showCreateForm ? 'Отменить' : 'Создать турнир'}
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <CreateTournamentForm
            formData={formData}
            mapInput={mapInput}
            onFormDataChange={(data) => setFormData({ ...formData, ...data })}
            onMapInputChange={setMapInput}
            onAddMap={handleAddMap}
            onRemoveMap={handleRemoveMap}
            onSubmit={handleCreateTournament}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <div className="space-y-4">
          {tournaments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Турниры не найдены</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Создать первый турнир
              </Button>
            </div>
          ) : (
            tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onUpdateStatus={handleUpdateStatus}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDeleteTournament}
                onGenerateBracket={handleGenerateBracket}
                onNavigate={(id) => navigate(`/tournaments/${id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
