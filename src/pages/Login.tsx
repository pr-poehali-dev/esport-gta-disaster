import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const AUTH_API_URL = 'https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4';

const GTA_CHARACTER = 'https://cdn.poehali.dev/projects/659da987-8745-4d52-9d31-3d9043c6e4d5/files/6aed713f-7a7b-46c0-98d2-bd40b4e0dafd.jpg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('session_token', data.session_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast({
          title: 'Успешно!',
          description: `Добро пожаловать, ${data.user.nickname}!`,
        });
        
        navigate('/');
        window.location.reload();
      } else {
        toast({
          title: 'Ошибка входа',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка соединения с сервером',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920')] bg-cover bg-center opacity-10" />
      
      <div className="relative z-10 w-full max-w-4xl flex bg-black/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl">
        <div className="hidden md:flex md:w-1/2 relative">
          <img
            src={GTA_CHARACTER}
            alt="Character"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-primary/20 rounded-full mb-4">
              <Icon name="LogIn" size={48} className="text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-white">ВХОД В АККАУНТ</h1>
            <p className="text-gray-400">Войдите в свой профиль</p>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mt-4" />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-semibold">ПОЧТА</label>
              <div className="relative">
                <Icon name="Mail" className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white h-12"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-semibold">ПАРОЛЬ</label>
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white h-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold text-lg"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={24} />
                  ВХОД...
                </>
              ) : (
                <>
                  <Icon name="LogIn" className="mr-2" size={24} />
                  ВОЙТИ
                </>
              )}
            </Button>
          </div>

          <div className="mt-8 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-gray-500">Или</span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-primary hover:text-secondary transition-colors"
              >
                Забыли пароль?
              </button>
              
              <p className="text-sm text-gray-400 mb-3">Нет учетной записи?</p>
              <Button
                onClick={() => navigate('/register')}
                variant="outline"
                className="w-full h-12 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Icon name="UserPlus" className="mr-2" size={20} />
                СОЗДАТЬ АККАУНТ
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-600">
              © 2025 Disaster Esports. Все права защищены
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}