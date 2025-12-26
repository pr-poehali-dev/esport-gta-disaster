import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { playClickSound, playHoverSound, playSuccessSound } from '@/utils/sounds';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    nickname: '',
    discord: '',
    team: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.login(loginData.email, loginData.password);
      playSuccessSound();
      
      toast({
        title: "✅ Добро пожаловать!",
        description: "Вы успешно вошли в систему",
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Ошибка входа",
        description: error instanceof Error ? error.message : "Проверьте email и пароль",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.email || !registerData.password || !registerData.nickname) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await authService.register(
        registerData.email,
        registerData.password,
        registerData.nickname,
        registerData.discord,
        registerData.team
      );
      playSuccessSound();
      
      toast({
        title: "✅ Регистрация успешна!",
        description: `Добро пожаловать, ${registerData.nickname}!`,
        className: "bg-gradient-to-r from-primary to-secondary text-white border-0",
      });
      
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Ошибка регистрации",
        description: error instanceof Error ? error.message : "Попробуйте другой email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[#1a1a2e]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDEzLDE0OCwyMzEsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <header className="relative z-10 border-b border-primary/20 bg-background/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <Icon name="ArrowLeft" size={20} />
            <span className="font-bold">На главную</span>
          </Button>
        </div>
      </header>

      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-full clip-corner flex items-center justify-center mx-auto mb-4 logo-pulse">
                <Icon name="Zap" className="text-white" size={40} />
              </div>
              <h1 className="text-4xl font-black mb-2 text-white">DISASTER ESPORTS</h1>
              <p className="text-muted-foreground">Войдите или создайте аккаунт</p>
            </div>

            <Card className="border-primary/30 bg-card/80 backdrop-blur neon-border">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Авторизация</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="font-bold">
                      <Icon name="LogIn" className="mr-2" size={18} />
                      Вход
                    </TabsTrigger>
                    <TabsTrigger value="register" className="font-bold">
                      <Icon name="UserPlus" className="mr-2" size={18} />
                      Регистрация
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold mb-2 block">Email</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">Пароль</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <Button 
                        type="submit"
                        disabled={loading}
                        onMouseEnter={playHoverSound}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-6 clip-corner"
                      >
                        <Icon name="LogIn" className="mr-2" size={20} />
                        {loading ? 'Входим...' : 'Войти'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className="text-sm font-bold mb-2 block">Email *</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          required
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">Пароль *</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          required
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">Никнейм *</label>
                        <Input
                          placeholder="ProGamer2025"
                          value={registerData.nickname}
                          onChange={(e) => setRegisterData({...registerData, nickname: e.target.value})}
                          required
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">Discord</label>
                        <Input
                          placeholder="username#1234"
                          value={registerData.discord}
                          onChange={(e) => setRegisterData({...registerData, discord: e.target.value})}
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold mb-2 block">Команда</label>
                        <Input
                          placeholder="Team Disaster"
                          value={registerData.team}
                          onChange={(e) => setRegisterData({...registerData, team: e.target.value})}
                          className="bg-background/50 border-primary/30 focus:border-primary"
                        />
                      </div>
                      <Button 
                        type="submit"
                        disabled={loading}
                        onMouseEnter={playHoverSound}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-6 clip-corner"
                      >
                        <Icon name="UserPlus" className="mr-2" size={20} />
                        {loading ? 'Регистрируем...' : 'Создать аккаунт'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
