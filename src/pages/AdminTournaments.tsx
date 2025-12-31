import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';
import TournamentCard from '@/components/admin/TournamentCard';
import CreateTournamentForm from '@/components/admin/CreateTournamentForm';
import BracketStyleSelector from '@/components/admin/BracketStyleSelector';

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
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

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
      
      console.log('Loading tournaments, user ID:', userId);
      
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

      console.log('Tournaments response status:', response.status);
      const data = await response.json();
      console.log('Tournaments data:', data);
      
      if (response.ok && data.tournaments) {
        setTournaments(data.tournaments || []);
      } else {
        console.error('Failed to load tournaments:', data);
        showNotification('error', 'Ошибка', data.error || 'Не удалось загрузить турниры');
      }
    } catch (error: any) {
      console.error('Exception loading tournaments:', error);
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

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handleDeleteTournament = async (tournamentId: number) => {
    if (!confirm('ВНИМАНИЕ! Удалить турнир? Это действие необратимо! Будут удалены все матчи, регистрации и чаты.')) return;

    setLogs([]);

    try {
      addLog('=== DELETE TOURNAMENT START ===');
      addLog(`Tournament ID: ${tournamentId}`);
      addLog(`User ID: ${user.id}`);

      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const requestBody = {
        action: 'delete_tournament',
        tournament_id: tournamentId
      };
      
      addLog(`Request body: ${JSON.stringify(requestBody)}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify(requestBody)
      });

      addLog(`Response status: ${response.status}`);
      addLog(`Response OK: ${response.ok}`);

      const data = await response.json();
      addLog(`Response data: ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.message) {
        addLog('✅ SUCCESS: Tournament deleted');
        showNotification('success', 'Успех', data.message);
        loadTournaments();
      } else {
        addLog(`❌ ERROR: Delete failed - ${JSON.stringify(data)}`);
        showNotification('error', 'Ошибка', data.error || 'Неизвестная ошибка');
      }
    } catch (error: any) {
      addLog(`❌ EXCEPTION: ${error.message}`);
      addLog(`Stack: ${error.stack}`);
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleGenerateBracket = async (tournamentId: number) => {
    setSelectedTournamentId(tournamentId);
    setShowStyleSelector(true);
  };

  const handleStyleSelect = async (styleId: string) => {
    if (!selectedTournamentId) return;

    setShowStyleSelector(false);

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'generate_bracket',
          tournament_id: selectedTournamentId,
          format: 'single_elimination',
          style: styleId
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showNotification('success', 'Успех', data.message || 'Турнирная сетка создана');
        loadTournaments();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось создать сетку');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }

    setSelectedTournamentId(null);
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
      <div className="container mx-auto max-w-7xl flex gap-6">
        {/* Основной контент */}
        <div className="flex-1">
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

        {showStyleSelector && (
          <BracketStyleSelector
            onSelect={handleStyleSelect}
            onCancel={() => {
              setShowStyleSelector(false);
              setSelectedTournamentId(null);
            }}
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
                onManageGroupStage={(id) => navigate(`/admin/tournaments/${id}/group-stage`)}
              />
            ))
          )}
        </div>
        </div>

        {/* Панель логов - всегда видна */}
        <div className="w-[400px] flex-shrink-0">
          <div className="sticky top-8 bg-[#1a1f2e]/80 backdrop-blur border border-purple-500/30 rounded-lg shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-purple-500/30">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Icon name="Terminal" size={16} />
                Живые логи
              </h3>
              {logs.length > 0 && (
                <Button
                  onClick={() => setLogs([])}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              )}
            </div>
            <div className="p-3 overflow-y-auto h-[calc(100vh-200px)] font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Terminal" size={48} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-500">Логи появятся здесь...</p>
                  <p className="text-gray-600 text-xs mt-2">Попробуйте удалить турнир</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`mb-1 ${
                      log.includes('ERROR') || log.includes('❌')
                        ? 'text-red-400'
                        : log.includes('SUCCESS') || log.includes('✅')
                        ? 'text-green-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}