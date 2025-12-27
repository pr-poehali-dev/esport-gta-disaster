import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function AdminModerationSection() {
  const mockReports = [
    { id: 1, reporter: 'Player123', reported: 'ToxicUser', reason: 'Оскорбления', date: '2025-01-15', status: 'Новая' },
    { id: 2, reporter: 'ProGamer', reported: 'Cheater99', reason: 'Читерство', date: '2025-01-15', status: 'В работе' },
    { id: 3, reporter: 'TeamLead', reported: 'Spammer', reason: 'Спам', date: '2025-01-14', status: 'Решена' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новая': return 'bg-red-500/20 text-red-500';
      case 'В работе': return 'bg-yellow-500/20 text-yellow-500';
      case 'Решена': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Модерация</h1>
        <Button variant="outline">
          <Icon name="RefreshCw" size={20} className="mr-2" />
          Обновить
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <Icon name="AlertTriangle" size={32} className="text-red-500" />
          <h3 className="text-2xl font-bold">5</h3>
          <p className="text-muted-foreground">Новых жалоб</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="Clock" size={32} className="text-yellow-500" />
          <h3 className="text-2xl font-bold">8</h3>
          <p className="text-muted-foreground">В работе</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="CheckCircle" size={32} className="text-green-500" />
          <h3 className="text-2xl font-bold">142</h3>
          <p className="text-muted-foreground">Решено за месяц</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Кто пожаловался</th>
                <th className="text-left p-4 font-semibold">На кого</th>
                <th className="text-left p-4 font-semibold">Причина</th>
                <th className="text-left p-4 font-semibold">Дата</th>
                <th className="text-left p-4 font-semibold">Статус</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockReports.map((report) => (
                <tr key={report.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 font-medium">{report.reporter}</td>
                  <td className="p-4 text-muted-foreground">{report.reported}</td>
                  <td className="p-4">{report.reason}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(report.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button size="sm" variant="default">
                        <Icon name="Check" size={16} />
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
