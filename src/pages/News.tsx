import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ADMIN_API = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function News() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['founder', 'admin', 'organizer'].includes(user.role);

  const [newsForm, setNewsForm] = useState({
    title: '',
    content: '',
    image: null as File | null,
  });

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_news',
          include_unpublished: isAdmin,
        }),
      });

      const data = await response.json();
      if (data.news) {
        setNews(data.news);
      }
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Ошибка',
          description: 'Размер файла не должен превышать 5 МБ',
          variant: 'destructive',
        });
        return;
      }
      setNewsForm({ ...newsForm, image: file });
    }
  };

  const handleCreateNews = async () => {
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      let imageBase64 = '';
      if (newsForm.image) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
          reader.readAsDataURL(newsForm.image!);
        });
      }

      const response = await fetch(ADMIN_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'create_news_with_image',
          title: newsForm.title,
          content: newsForm.content,
          image: imageBase64,
          published: true,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: 'Новость опубликована',
        });
        setCreateDialogOpen(false);
        setNewsForm({ title: '', content: '', image: null });
        loadNews();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать новость',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewsDetails = (item: any) => {
    navigate(`/news/${item.id}`);
  };

  if (loading && news.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Новости</h1>
          {isAdmin && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать новость
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Создание новости</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Заголовок новости *</label>
                    <Input
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      placeholder="Введите заголовок..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Изображение (шапка новости)</label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer px-4 py-2 bg-muted rounded flex items-center gap-2 hover:bg-muted/80 transition-colors">
                        <Icon name="Upload" size={18} />
                        <span>{newsForm.image ? newsForm.image.name : 'Выбрать файл'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {newsForm.image && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setNewsForm({ ...newsForm, image: null })}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Суть новости *</label>
                    <Textarea
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      placeholder="Опишите новость..."
                      rows={6}
                    />
                  </div>

                  <Button onClick={handleCreateNews} disabled={loading} className="w-full">
                    {loading ? <Icon name="Loader2" className="animate-spin mr-2" size={18} /> : <Icon name="Send" className="mr-2" size={18} />}
                    Опубликовать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Card
              key={item.id}
              className="hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => openNewsDetails(item)}
            >
              {item.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString('ru-RU')} • {item.author_name}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {news.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Icon name="Newspaper" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Новостей пока нет</p>
            </div>
          </Card>
        )}

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedNews && (
              <>
                {selectedNews.image_url && (
                  <img
                    src={selectedNews.image_url}
                    alt={selectedNews.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedNews.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedNews.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })} • Автор: {selectedNews.author_name}
                  </p>
                </DialogHeader>
                <div className="mt-6 prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedNews.content}</p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}