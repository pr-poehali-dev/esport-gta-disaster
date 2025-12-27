import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminLoginProps {
  password: string;
  setPassword: (value: string) => void;
  handleLogin: () => void;
  onNavigateHome: () => void;
}

export default function AdminLogin({ password, setPassword, handleLogin, onNavigateHome }: AdminLoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <Icon name="Shield" size={48} className="mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Админ-Панель</h1>
          <p className="text-muted-foreground">Введите административный пароль</p>
        </div>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Пароль администратора"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="text-center"
          />
          <Button onClick={handleLogin} className="w-full">
            <Icon name="LogIn" size={20} className="mr-2" />
            Войти
          </Button>
          <Button
            variant="outline"
            onClick={onNavigateHome}
            className="w-full"
          >
            Вернуться на главную
          </Button>
        </div>
      </Card>
    </div>
  );
}
