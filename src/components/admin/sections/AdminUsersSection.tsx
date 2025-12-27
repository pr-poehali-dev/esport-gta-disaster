import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export function AdminUsersSection() {
  const mockUsers = [
    { id: 1, username: 'ProGamer', email: 'progamer@example.com', role: 'Пользователь', status: 'Активен' },
    { id: 2, username: 'TeamLead', email: 'lead@example.com', role: 'Капитан', status: 'Активен' },
    { id: 3, username: 'AdminUser', email: 'admin@example.com', role: 'Администратор', status: 'Активен' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Пользователями</h1>
        <Button>
          <Icon name="UserPlus" size={20} className="mr-2" />
          Добавить пользователя
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Поиск по username или email..." className="flex-1" />
        <Button variant="outline">
          <Icon name="Search" size={20} />
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Username</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Роль</th>
                <th className="text-left p-4 font-semibold">Статус</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-sm">
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Icon name="Eye" size={16} />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Icon name="Ban" size={16} />
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
