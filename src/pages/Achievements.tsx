import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { AchievementsList } from '@/components/AchievementSystem';

export default function Achievements() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-[#1a1a2e]">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/profile')}
              className="mb-6"
            >
              <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Назад в профиль
            </Button>

            <h1 className="text-5xl font-black mb-6 text-gradient">
              Достижения
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Выполняйте задания и получайте уникальные награды
            </p>
          </div>

          <AchievementsList />
        </div>
      </main>

      <Footer />
    </div>
  );
}
