import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function AdminTournamentsSection() {
  const mockTournaments = [
    { id: 1, name: 'CS2 Championship 2025', status: 'Активен', participants: 32, prize: '500,000₽' },
    { id: 2, name: 'Dota 2 Spring Cup', status: 'Регистрация', participants: 16, prize: '300,000₽' },
    { id: 3, name: 'Valorant Masters', status: 'Завершен', participants: 24, prize: '200,000₽' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Активен': return 'bg-green-500/20 text-green-500';
      case 'Регистрация': return 'bg-blue-500/20 text-blue-500';
      case 'Завершен': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Турнирами</h1>
        <Button>
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
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockTournaments.map((tournament) => (
                <tr key={tournament.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 font-medium">{tournament.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{tournament.participants}</td>
                  <td className="p-4 font-semibold">{tournament.prize}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="destructive">
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
    </div>
  );
}
