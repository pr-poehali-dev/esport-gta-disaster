import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';
import { unlockAchievement } from '@/components/AchievementSystem';

const AUTH_API_URL = 'https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4';

const GTA_CHARACTERS = [
  'https://cdn.poehali.dev/projects/659da987-8745-4d52-9d31-3d9043c6e4d5/files/2d2ae00c-accc-4834-8757-8c6023a8e211.jpg',
  'https://cdn.poehali.dev/projects/659da987-8745-4d52-9d31-3d9043c6e4d5/files/d68fc26e-3acc-4fae-9163-6a8034e00477.jpg',
  'https://cdn.poehali.dev/projects/659da987-8745-4d52-9d31-3d9043c6e4d5/files/0fda8d80-3a6a-449e-a3a0-75585e4d50db.jpg'
];

export default function Register() {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkNickname = async () => {
    if (!nickname.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите имя пользователя',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_nickname', nickname }),
      });

      const data = await response.json();
      
      if (data.available) {
        setStep(1);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Данное имя пользователя занято',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка проверки никнейма',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEmail = async () => {
    if (!email.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите email',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный email',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_email', email }),
      });

      const data = await response.json();
      
      if (data.available) {
        setStep(2);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Данная почта уже привязана к другому аккаунту',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка проверки email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!password || password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть не менее 6 символов',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
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
          action: 'register',
          nickname,
          email,
          password,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setUserEmail(email);
        setRegistered(true);
        toast({
          title: 'Успешно!',
          description: data.message,
        });
        showNotification('success', 'Регистрация успешна!', 'Проверьте почту для подтверждения');
        unlockAchievement('first_registration');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка регистрации',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_verification',
          email: userEmail,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Письмо отправлено повторно',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка отправки письма',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920')] bg-cover bg-center opacity-10" />
        
        <div className="relative z-10 w-full max-w-4xl flex bg-black/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl">
          <div className="hidden md:flex md:w-1/2 relative">
            <img
              src={GTA_CHARACTERS[2]}
              alt="Character"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-green-500/20 rounded-full mb-4">
                <Icon name="Mail" size={48} className="text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">ПОДТВЕРЖДЕНИЕ</h1>
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-6" />
              <p className="text-gray-300 mb-2">
                Письмо с подтверждением отправлено на:
              </p>
              <p className="text-primary font-semibold text-lg mb-6">{userEmail}</p>
              <p className="text-sm text-gray-400">
                Перейдите по ссылке в письме для завершения регистрации
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={resendEmail}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Icon name="RefreshCw" size={20} className="mr-2" />
                Отправить снова
              </Button>

              <Button
                onClick={() => navigate('/login')}
                variant="secondary"
                className="w-full"
              >
                Перейти ко входу
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-8">
              Не получили письмо? Проверьте папку "Спам"
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920')] bg-cover bg-center opacity-10" />
      
      <div className="relative z-10 w-full max-w-4xl flex bg-black/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <Icon name="X" size={24} className="text-white" />
        </button>
        
        <div className="hidden md:flex md:w-1/2 relative">
          <img
            src={GTA_CHARACTERS[step]}
            alt="Character"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80" />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">
              СОЗДАНИЕ АККАУНТА - ШАГ {step + 1}
            </h1>
            <p className="text-gray-400">
              {step === 0 && 'Введите основные данные!'}
              {step === 1 && 'Укажите вашу почту!'}
              {step === 2 && 'Выберите надежный пароль!'}
            </p>
            <div className="h-1 w-full bg-gray-800 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${((step + 1) / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-6">
              <div className="relative">
                <Icon name="User" className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                  type="text"
                  placeholder="Никнейм"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkNickname()}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white h-12"
                  disabled={loading}
                />
              </div>

              <Button
                onClick={checkNickname}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
              >
                {loading ? 'ПРОВЕРКА...' : 'ПРОДОЛЖИТЬ →'}
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="relative">
                <Icon name="Mail" className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkEmail()}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white h-12"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(0)}
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  ← НАЗАД
                </Button>
                <Button
                  onClick={checkEmail}
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
                >
                  {loading ? 'ПРОВЕРКА...' : 'ПРОДОЛЖИТЬ →'}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white h-12"
                  disabled={loading}
                />
              </div>

              <div className="relative">
                <Icon name="Lock" className="absolute left-3 top-3 text-gray-500" size={20} />
                <Input
                  type="password"
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white h-12"
                  disabled={loading}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-12"
                  disabled={loading}
                >
                  ← НАЗАД
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
                >
                  {loading ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ АККАУНТ'}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 mb-3">Уже есть учетная запись?</p>
            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="text-primary hover:text-primary/80"
            >
              Нажмите для входа
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}