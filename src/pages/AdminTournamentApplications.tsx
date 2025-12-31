import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface Application {
  id: number;
  team_id: number;
  team_name: string;
  team_tag: string;
  logo_url: string;
  members_count: number;
  registered_at: string;
  status: string;
}

interface Tournament {
  id: number;
  name: string;
}

export default function AdminTournamentApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user?.id?.toString() || '0'
        },
        body: JSON.stringify({
          action: 'get_tournament',
          tournament_id: parseInt(id || '0')
        })
      });

      const data = await response.json();
      if (data) {
        setTournament(data);
        setApplications(data.registrations || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      showNotification('error', 'Ошибка', 'Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: number, newStatus: string) => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      
      let action = 'reject_registration';
      if (newStatus === 'approved') {
        action = 'approve_registration';
      } else if (newStatus === 'pending') {
        action = 'approve_registration';
      }
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action,
          application_id: applicationId,
          approved: newStatus === 'approved'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showNotification('success', 'Успех', data.message || 'Статус обновлен');
        loadData();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось обновить статус');
      }
    } catch (error: any) {
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
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/admin/tournaments')}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">Заявки на участие</h1>
            {tournament && (
              <p className="text-gray-400 mt-1">{tournament.name}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card className="bg-[#1a1f2e]/50 border-white/10 p-12 text-center">
              <Icon name="Inbox" size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Заявок пока нет</p>
            </Card>
          ) : (
            applications.map((app) => (
              <Card key={app.id} className="bg-[#1a1f2e]/50 border-white/10 p-6">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    {app.logo_url ? (
                      <img 
                        src={app.logo_url} 
                        alt={app.team_name} 
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Icon name="Shield" size={32} className="text-purple-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{app.team_name}</h3>
                      {app.team_tag && (
                        <span className="text-gray-400 text-sm">[{app.team_tag}]</span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        app.status === 'approved' 
                          ? 'bg-green-500/20 text-green-400' 
                          : app.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {app.status === 'approved' ? 'Одобрено' : app.status === 'rejected' ? 'Отклонено' : 'На рассмотрении'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {app.members_count && (
                        <span className="flex items-center gap-1">
                          <Icon name="Users" size={14} />
                          Участников: {app.members_count}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        Подана: {new Date(app.registered_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {app.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleUpdateStatus(app.id, 'approved')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Icon name="Check" size={16} className="mr-2" />
                          Одобрить
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          <Icon name="X" size={16} className="mr-2" />
                          Отклонить
                        </Button>
                      </>
                    )}
                    {app.status === 'approved' && (
                      <Button
                        onClick={() => handleUpdateStatus(app.id, 'pending')}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                      >
                        <Icon name="RotateCcw" size={16} className="mr-2" />
                        Вернуть в ожидание
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}