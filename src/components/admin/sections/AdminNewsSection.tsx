import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function AdminNewsSection() {
  const mockNews = [
    { id: 1, title: 'Анонс нового турнира CS2', date: '2025-01-15', status: 'Опубликовано', views: 1245 },
    { id: 2, title: 'Обновление правил платформы', date: '2025-01-14', status: 'Опубликовано', views: 856 },
    { id: 3, title: 'Итоги Dota 2 Spring Cup', date: '2025-01-13', status: 'Черновик', views: 0 },
  ];

  const getStatusColor = (status: string) => {
    return status === 'Опубликовано' 
      ? 'bg-green-500/20 text-green-500' 
      : 'bg-yellow-500/20 text-yellow-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Новостями</h1>
        <Button>
          <Icon name="Plus" size={20} className="mr-2" />
          Создать новость
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Заголовок</th>
                <th className="text-left p-4 font-semibold">Дата</th>
                <th className="text-left p-4 font-semibold">Статус</th>
                <th className="text-left p-4 font-semibold">Просмотры</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockNews.map((news) => (
                <tr key={news.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 font-medium">{news.title}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(news.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(news.status)}`}>
                      {news.status}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{news.views}</td>
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
