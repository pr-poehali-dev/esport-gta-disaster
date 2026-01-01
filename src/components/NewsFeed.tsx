import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { showNotification } from './NotificationSystem';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  slug: string;
  content?: string;
}

export default function NewsFeed() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: 'get_news',
          include_unpublished: false
        })
      });

      const data = await response.json();
      
      if (response.ok && data.news) {
        const formattedNews = data.news.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          description: item.content.substring(0, 150) + '...',
          image: item.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
          date: new Date(item.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          category: 'Новости',
          slug: `news/${item.id}`,
          content: item.content
        }));
        setNews(formattedNews);
      }
    } catch (error: any) {
      console.error('Ошибка загрузки новостей:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Все', 'Новости'];

  const filteredNews =
    selectedCategory === 'all'
      ? news
      : news.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Icon name="Loader2" className="h-12 w-12 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
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

        {filteredNews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredNews.map((newsItem, index) => (
                <NewsCard key={newsItem.id} {...newsItem} index={index} />
              ))}
            </div>

            {filteredNews.length >= 6 && (
              <div className="text-center">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 font-bold font-mono"
                  onClick={loadNews}
                >
                  ОБНОВИТЬ
                  <Icon name="RefreshCw" className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Icon name="Newspaper" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">Новостей пока нет</h3>
            <p className="text-muted-foreground">Скоро здесь появятся свежие новости</p>
          </div>
        )}
      </div>
    </section>
  );
}