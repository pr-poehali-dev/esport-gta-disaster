import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

export function AdminSettingsSection() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Настройки</h1>

      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Общие настройки</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Название сайта</Label>
              <Input id="siteName" defaultValue="Disaster eSports" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Описание</Label>
              <Input id="siteDescription" defaultValue="Платформа для киберспортивных турниров" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email для связи</Label>
              <Input id="contactEmail" type="email" defaultValue="admin@disaster.gg" />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Функциональность</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Регистрация новых пользователей</Label>
                <p className="text-sm text-muted-foreground">Разрешить новым пользователям регистрироваться</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Модерация комментариев</Label>
                <p className="text-sm text-muted-foreground">Требовать одобрение комментариев</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">Отправлять уведомления пользователям</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Безопасность</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Двухфакторная аутентификация</Label>
                <p className="text-sm text-muted-foreground">Требовать 2FA для администраторов</p>
              </div>
              <Switch />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Таймаут сессии (минуты)</Label>
              <Input id="sessionTimeout" type="number" defaultValue="60" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button>
            <Icon name="Save" size={20} className="mr-2" />
            Сохранить изменения
          </Button>
          <Button variant="outline">
            Отмена
          </Button>
        </div>
      </Card>
    </div>
  );
}
