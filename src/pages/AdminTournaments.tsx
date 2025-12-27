import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function AdminTournaments() {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('GTA V');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('32');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
        return false;
      }
      try {
        const userData = JSON.parse(user);
        if (!['admin', 'founder', 'organizer'].includes(userData.role)) {
          navigate('/');
          return false;
        }
        return true;
      } catch (e) {
        navigate('/login');
        return false;
      }
    };

    checkAuth();
  }, [navigate]);

  const handleCreate = () => {
    if (!title || !startDate || !prizePool) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Турнир создан',
      description: `Турнир "${title}" успешно создан`
    });

    setTitle('');
    setDescription('');
    setStartDate('');
    setPrizePool('');
    setMaxParticipants('32');
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Управление турнирами</h1>
          <div className="flex gap-2">
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Icon name="Plus" className="mr-2 h-4 w-4" />
                Создать турнир
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <Icon name="ArrowLeft" className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </div>
        </div>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Создание нового турнира</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название турнира *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Весенний кубок 2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Игра</label>
                  <Input
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    placeholder="GTA V"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Макс. участников</label>
                  <Input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите турнир..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Дата начала *</label>
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Призовой фонд *</label>
                  <Input
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    placeholder="100 000 ₽"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreate}>
                  Создать турнир
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-muted-foreground text-center py-8">
          Функция управления турнирами в разработке
        </div>
      </main>
      <Footer />
    </div>
  );
}
