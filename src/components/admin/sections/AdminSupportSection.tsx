import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function AdminSupportSection() {
  const mockTickets = [
    { id: 1, user: 'Player123', subject: 'Не могу войти в аккаунт', priority: 'Высокий', status: 'Открыт', date: '2025-01-15' },
    { id: 2, user: 'ProGamer', subject: 'Вопрос по турниру', priority: 'Средний', status: 'В работе', date: '2025-01-15' },
    { id: 3, user: 'NewUser', subject: 'Как изменить никнейм?', priority: 'Низкий', status: 'Закрыт', date: '2025-01-14' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Высокий': return 'bg-red-500/20 text-red-500';
      case 'Средний': return 'bg-yellow-500/20 text-yellow-500';
      case 'Низкий': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Открыт': return 'bg-blue-500/20 text-blue-500';
      case 'В работе': return 'bg-yellow-500/20 text-yellow-500';
      case 'Закрыт': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Поддержка</h1>
        <Button variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <Icon name="Inbox" size={32} className="text-primary" />
          <h3 className="text-2xl font-bold">12</h3>
          <p className="text-muted-foreground">Открытых обращений</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="Clock" size={32} className="text-yellow-500" />
          <h3 className="text-2xl font-bold">8</h3>
          <p className="text-muted-foreground">В работе</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="CheckCircle" size={32} className="text-green-500" />
          <h3 className="text-2xl font-bold">94%</h3>
          <p className="text-muted-foreground">Решено за день</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Пользователь</th>
                <th className="text-left p-4 font-semibold">Тема</th>
                <th className="text-left p-4 font-semibold">Приоритет</th>
                <th className="text-left p-4 font-semibold">Статус</th>
                <th className="text-left p-4 font-semibold">Дата</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 font-medium">{ticket.user}</td>
                  <td className="p-4">{ticket.subject}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(ticket.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button size="sm" variant="default">
                        <Icon name="MessageCircle" size={16} />
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
