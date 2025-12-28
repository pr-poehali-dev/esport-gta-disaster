import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNews();
  }, [id]);

  const loadNews = async () => {
    try {
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_news', include_unpublished: false }),
      });

      const data = await response.json();
      if (data.news) {
        const foundNews = data.news.find((n: any) => n.id === parseInt(id || '0'));
        if (foundNews) {
          setNews(foundNews);
        } else {
          toast({
            title: 'Ошибка',
            description: 'Новость не найдена',
            variant: 'destructive',
          });
          navigate('/news');
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить новость',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4">
          <p className="text-center text-muted-foreground">Новость не найдена</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          {news.image_url && (
            <div className="w-full h-64 md:h-96 overflow-hidden rounded-t-lg">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">{news.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Icon name="User" size={14} />
                {news.author_name}
              </div>
              <div className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                {new Date(news.created_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap">
              {news.content}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
