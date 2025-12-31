import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface News {
  id: number;
  title: string;
  content: string;
  author_id: number;
  published: boolean;
  created_at: string;
  image_url: string | null;
  pinned: boolean;
}

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export function AdminNewsSection() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    published: true,
    pinned: false
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    addLog('=== НАЧАЛО ЗАГРУЗКИ НОВОСТЕЙ ===');
    addLog(`User ID: ${user.id}`);
    
    try {
      const requestBody = { 
        action: 'get_news',
        include_unpublished: true,
        limit: 100
      };
      
      addLog(`Request body: ${JSON.stringify(requestBody)}`);
      addLog(`Fetching: ${API_URL}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id?.toString() || '0'
        },
        body: JSON.stringify(requestBody)
      });

      addLog(`Response status: ${response.status} ${response.statusText}`);
      addLog(`Response ok: ${response.ok}`);
      
      const data = await response.json();
      addLog(`Response data: ${JSON.stringify(data).substring(0, 200)}...`);
      
      if (response.ok && data.news) {
        addLog(`✅ Успешно загружено ${data.news.length} новостей`);
        setNews(data.news);
      } else {
        addLog(`❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`);
        console.error('Failed to load news:', data);
        showNotification('error', 'Ошибка', data.error || 'Не удалось загрузить новости');
      }
    } catch (error: any) {
      addLog(`❌ Exception: ${error.message}`);
      addLog(`Stack: ${error.stack}`);
      console.error('Exception loading news:', error);
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
      addLog('=== КОНЕЦ ЗАГРУЗКИ ===');
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.content) {
      showNotification('error', 'Ошибка', 'Заполните название и содержание');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'create_news',
          ...formData
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showNotification('success', 'Успех', 'Новость создана');
        setShowCreateForm(false);
        setFormData({ title: '', content: '', image_url: '', published: true, pinned: false });
        loadNews();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось создать новость');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleUpdate = async () => {
    if (!editingNews) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString()
        },
        body: JSON.stringify({
          action: 'update_news',
          news_id: editingNews.id,
          ...formData
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showNotification('success', 'Успех', 'Новость обновлена');
        setEditingNews(null);
        setFormData({ title: '', content: '', image_url: '', published: true, pinned: false });
        loadNews();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось обновить новость');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleDelete = async (newsId: number) => {
    if (!confirm('Удалить новость?')) return;

    try {
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
      if (response.ok && data.success) {
        showNotification('success', 'Успех', 'Новость удалена');
        loadNews();
      } else {
        showNotification('error', 'Ошибка', data.error || 'Не удалось удалить новость');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      image_url: newsItem.image_url || '',
      published: newsItem.published,
      pinned: newsItem.pinned
    });
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingNews(null);
    setFormData({ title: '', content: '', image_url: '', published: true, pinned: false });
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Новостями</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Icon name={showCreateForm ? "X" : "Plus"} size={20} className="mr-2" />
          {showCreateForm ? 'Отменить' : 'Создать новость'}
        </Button>
      </div>

      <Card className="p-4 bg-black/50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-green-400">Логи загрузки</h3>
          <Button size="sm" variant="outline" onClick={() => setLogs([])}>
            Очистить
          </Button>
        </div>
        <div className="bg-black/80 p-3 rounded font-mono text-xs text-green-400 max-h-[300px] overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Логи появятся здесь...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))
          )}
        </div>
      </Card>

      {showCreateForm && (
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingNews ? 'Редактировать новость' : 'Создать новость'}
          </h2>
          <div className="space-y-4">
            <div>
              <Label>Заголовок *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Заголовок новости"
              />
            </div>
            <div>
              <Label>Содержание *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Текст новости"
                className="min-h-[200px]"
              />
            </div>
            <div>
              <Label>URL изображения</Label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
                <span>Опубликовать</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.pinned}
                  onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                />
                <span>Закрепить</span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button onClick={editingNews ? handleUpdate : handleCreate}>
                <Icon name={editingNews ? "Save" : "Plus"} size={16} className="mr-2" />
                {editingNews ? 'Сохранить' : 'Создать'}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Заголовок</th>
                <th className="text-left p-4 font-semibold">Дата</th>
                <th className="text-left p-4 font-semibold">Статус</th>
                <th className="text-left p-4 font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {news.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Новостей пока нет
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {item.pinned && (
                          <Icon name="Pin" size={14} className="text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.published 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {item.published ? 'Опубликовано' : 'Черновик'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}