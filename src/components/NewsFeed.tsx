import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import NewsCard from './NewsCard';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  slug: string;
}

export default function NewsFeed() {
  const headerAnimation = useScrollAnimation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['Все', 'Турниры', 'Объявления', 'Результаты', 'Новости команд'];

  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Анонс турнира DISASTER CUP 2025',
      description: 'Приглашаем все команды принять участие в крупнейшем турнире сезона с призовым фондом $100,000. Регистрация открыта до 15 января.',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      date: '27 декабря 2024',
      category: 'Турниры',
      slug: 'disaster-cup-2025-announcement',
    },
    {
      id: '2',
      title: 'Итоги квалификации Winter Season',
      description: 'Подведены итоги квалификационного этапа. 16 команд прошли в плей-офф и сразятся за главный приз.',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
      date: '26 декабря 2024',
      category: 'Результаты',
      slug: 'winter-season-qualification-results',
    },
    {
      id: '3',
      title: 'Новый состав команды PHANTOM',
      description: 'Команда PHANTOM объявляет об изменениях в составе. Два новых игрока присоединяются к команде перед стартом нового сезона.',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
      date: '25 декабря 2024',
      category: 'Новости команд',
      slug: 'phantom-roster-update',
    },
    {
      id: '4',
      title: 'Обновление правил турниров',
      description: 'Вступают в силу новые правила проведения турниров. Ознакомьтесь с изменениями перед следующими матчами.',
      image: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&q=80',
      date: '24 декабря 2024',
      category: 'Объявления',
      slug: 'tournament-rules-update',
    },
    {
      id: '5',
      title: 'VORTEX выигрывает IEM Katowice',
      description: 'Команда VORTEX одерживает победу на IEM Katowice, обыграв в финале NAVI со счетом 3:1.',
      image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80',
      date: '23 декабря 2024',
      category: 'Результаты',
      slug: 'vortex-wins-iem-katowice',
    },
    {
      id: '6',
      title: 'Открытие нового тренировочного центра',
      description: 'DISASTER ESPORTS открывает собственный тренировочный центр с современным оборудованием для команд.',
      image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80',
      date: '22 декабря 2024',
      category: 'Объявления',
      slug: 'new-training-facility',
    },
  ];

  const filteredNews =
    selectedCategory === 'all'
      ? mockNews
      : mockNews.filter((news) => news.category === selectedCategory);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerAnimation.ref}
          className={`text-center mb-16 transition-all duration-700 ${
            headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-light tracking-[0.3em] text-muted-foreground/60 mb-2">
              DISASTER ESPORTS
            </h1>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black mb-4">
            Последние <span className="text-gradient">Новости</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Анонсы турниров, результаты матчей и новости команд
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category === 'Все' ? 'all' : category)
              }
              className={`px-4 py-2 font-bold text-sm font-mono pixel-corners transition-all duration-300 ${
                (category === 'Все' && selectedCategory === 'all') ||
                selectedCategory === category
                  ? 'bg-primary text-background border border-primary'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredNews.map((news, index) => (
            <NewsCard key={news.id} {...news} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 font-bold font-mono"
          >
            ЗАГРУЗИТЬ ЕЩЁ
            <Icon name="ChevronDown" className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}