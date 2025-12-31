import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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

interface TournamentCardProps {
  tournament: Tournament;
  onUpdateStatus: (tournamentId: number, status: string) => void;
  onToggleVisibility: (tournamentId: number, isHidden: boolean) => void;
  onDelete: (tournamentId: number) => void;
  onGenerateBracket: (tournamentId: number) => void;
  onNavigate: (tournamentId: number) => void;
}

export default function TournamentCard({
  tournament,
  onUpdateStatus,
  onToggleVisibility,
  onDelete,
  onGenerateBracket,
  onNavigate
}: TournamentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/20 text-blue-400';
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Предстоящий';
      case 'active': return 'Активный';
      case 'completed': return 'Завершен';
      default: return status;
    }
  };

  return (
    <Card className="bg-[#1a1f2e]/50 border-white/10 p-6 hover:border-purple-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
            {tournament.is_hidden && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                СКРЫТ
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(tournament.status)}`}>
              {getStatusText(tournament.status)}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">{tournament.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Призовой фонд:</span>
              <span className="text-white ml-2">{tournament.prize_pool || 'Не указан'}</span>
            </div>
            <div>
              <span className="text-gray-500">Локация:</span>
              <span className="text-white ml-2">{tournament.location || 'Онлайн'}</span>
            </div>
            <div>
              <span className="text-gray-500">Формат:</span>
              <span className="text-white ml-2">{tournament.format}</span>
            </div>
            <div>
              <span className="text-gray-500">Команды:</span>
              <span className="text-white ml-2">{tournament.registered_teams || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Дата старта:</span>
              <span className="text-white ml-2">
                {tournament.start_date 
                  ? new Date(tournament.start_date).toLocaleDateString('ru-RU')
                  : 'Не указана'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onNavigate(tournament.id)}
          variant="outline"
          size="sm"
          className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
        >
          <Icon name="Eye" size={16} className="mr-2" />
          Просмотр
        </Button>

        {tournament.status === 'upcoming' && (
          <Button
            onClick={() => onUpdateStatus(tournament.id, 'active')}
            variant="outline"
            size="sm"
            className="border-green-500/50 text-green-400 hover:bg-green-500/20"
          >
            <Icon name="Play" size={16} className="mr-2" />
            Начать
          </Button>
        )}

        {tournament.status === 'active' && (
          <Button
            onClick={() => onUpdateStatus(tournament.id, 'completed')}
            variant="outline"
            size="sm"
            className="border-gray-500/50 text-gray-400 hover:bg-gray-500/20"
          >
            <Icon name="CheckCircle" size={16} className="mr-2" />
            Завершить
          </Button>
        )}

        <Button
          onClick={() => onGenerateBracket(tournament.id)}
          variant="outline"
          size="sm"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
        >
          <Icon name="Network" size={16} className="mr-2" />
          Сетка
        </Button>

        <Button
          onClick={() => onToggleVisibility(tournament.id, tournament.is_hidden || false)}
          variant="outline"
          size="sm"
          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
        >
          <Icon name={tournament.is_hidden ? "Eye" : "EyeOff"} size={16} className="mr-2" />
          {tournament.is_hidden ? 'Показать' : 'Скрыть'}
        </Button>

        <Button
          onClick={() => onDelete(tournament.id)}
          variant="outline"
          size="sm"
          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
        >
          <Icon name="Trash2" size={16} className="mr-2" />
          Удалить
        </Button>
      </div>
    </Card>
  );
}
