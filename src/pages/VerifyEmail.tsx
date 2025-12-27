import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playSuccessSound } from '@/utils/sounds';
import { showNotification } from '@/components/NotificationSystem';
import { unlockAchievement } from '@/components/AchievementSystem';
import { addXP, XP_REWARDS } from '@/components/LevelSystem';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Токен подтверждения не найден');
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_email',
          token,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email успешно подтвержден!');
        
        localStorage.setItem('session_token', data.session_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        playSuccessSound();
        toast({
          title: '✅ Email подтвержден!',
          description: 'Добро пожаловать на платформу!',
          className: 'bg-gradient-to-r from-primary to-secondary text-white border-0',
        });
        showNotification('success', 'Email подтвержден!', 'Добро пожаловать на DISASTER ESPORTS');
        unlockAchievement('email_verified');
        const xpResult = addXP(XP_REWARDS.EMAIL_VERIFIED);
        if (xpResult.leveledUp) {
          showNotification('success', 'Повышение уровня!', `Вы достигли ${xpResult.newLevel} уровня!`);
        }

        setTimeout(() => {
          navigate('/');
          window.location.reload();
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Не удалось подтвердить email');
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось подтвердить email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      setStatus('error');
      setMessage('Произошла ошибка при подтверждении email');
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при подтверждении email',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e] flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEzLDE0OCwyMzEsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <Card className="relative z-10 w-full max-w-md border-primary/30 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            {status === 'loading' && (
              <>
                <Icon name="Mail" className="text-primary animate-pulse" size={32} />
                Проверка email...
              </>
            )}
            {status === 'success' && (
              <>
                <Icon name="CheckCircle" className="text-green-500" size={32} />
                Email подтвержден!
              </>
            )}
            {status === 'error' && (
              <>
                <Icon name="XCircle" className="text-red-500" size={32} />
                Ошибка подтверждения
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>
            
            {status === 'success' && (
              <div className="py-4">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-sm text-muted-foreground">
                  Перенаправление в профиль...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-gradient-to-r from-primary to-secondary"
                >
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Вернуться на страницу входа
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;