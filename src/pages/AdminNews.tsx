import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface News {
  id: number;
  title: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_name: string;
}

export default function AdminNews() {
  const navigate = useNavigate();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      if (!['admin', 'founder'].includes(userData.role)) {
        showNotification('error', 'Доступ запрещен', 'У вас нет прав администратора');
        navigate('/');
        return;
      }
    } else {
      navigate('/');
      return;
    }

    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const userId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : '');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({ action: 'get_news', include_unpublished: true })
      });

      const data = await response.json();
      
      if (response.ok) {
        setNews(data.news || []);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      showNotification('error', 'Ошибка', 'Заполните все поля');
      return;
    }

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: editingNews ? 'update_news' : 'create_news',
          ...(editingNews ? { news_id: editingNews.id } : {}),
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', editingNews ? 'Новость обновлена' : 'Новость создана');
        setShowEditor(false);
        setEditingNews(null);
        setFormData({ title: '', content: '', published: false });
        loadNews();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleTogglePublish = async (newsItem: News) => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'update_news',
          news_id: newsItem.id,
          published: !newsItem.published
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', newsItem.published ? 'Новость снята с публикации' : 'Новость опубликована');
        loadNews();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleEditNews = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      published: newsItem.published
    });
    setShowEditor(true);
  };

  const handleDeleteNews = async (newsId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'delete_news',
          news_id: newsId
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', 'Новость удалена');
        loadNews();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Icon name="Loader2" className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Управление новостями</h1>
          <p className="text-muted-foreground">Создавайте и публикуйте новости</p>
        </div>
        <Button onClick={() => setShowEditor(!showEditor)}>
          <Icon name={showEditor ? 'X' : 'Plus'} className="h-4 w-4 mr-2" />
          {showEditor ? 'Отмена' : 'Создать новость'}
        </Button>
      </div>

      {showEditor && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingNews ? 'Редактировать новость' : 'Новая новость'}
          </h2>
          <form onSubmit={handleSaveNews} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Заголовок новости"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Содержание *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Текст новости"
                rows={8}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="published" className="text-sm font-medium">
                Опубликовать сразу
              </label>
            </div>

            <Button type="submit" className="w-full">
              <Icon name="Save" className="h-4 w-4 mr-2" />
              {editingNews ? 'Обновить новость' : 'Создать новость'}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {news.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    item.published 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-gray-500/20 text-gray-500'
                  }`}>
                    {item.published ? 'Опубликовано' : 'Черновик'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Автор: {item.author_name} • Создано: {new Date(item.created_at).toLocaleDateString('ru-RU')} • 
                  Обновлено: {new Date(item.updated_at).toLocaleDateString('ru-RU')}
                </p>
                <p className="text-muted-foreground line-clamp-2">{item.content}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => handleTogglePublish(item)}>
                  <Icon name={item.published ? 'EyeOff' : 'Eye'} className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEditNews(item)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteNews(item.id)}>
                  <Icon name="Trash" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {news.length === 0 && !showEditor && (
        <div className="text-center py-20">
          <Icon name="Newspaper" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">Новостей нет</h3>
          <p className="text-muted-foreground mb-4">Создайте первую новость</p>
          <Button onClick={() => setShowEditor(true)}>
            <Icon name="Plus" className="h-4 w-4 mr-2" />
            Создать новость
          </Button>
        </div>
      )}
    </div>
  );
}
