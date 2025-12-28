import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

export default function Support() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadSupport();
  }, []);

  const loadSupport = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const userId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : '');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({ action: 'get_support' })
      });

      const data = await response.json();
      
      if (response.ok) {
        setContent(data.content || 'Контакты поддержки не установлены');
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editContent) {
      showNotification('error', 'Ошибка', 'Введите текст');
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
          action: 'update_support',
          content: editContent
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', 'Контакты обновлены');
        setShowEditor(false);
        setEditContent('');
        loadSupport();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-bold"
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p key={index} className="mb-2">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  const canEdit = user && user.role === 'founder';

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
          <h1 className="text-3xl font-black">Поддержка</h1>
          <p className="text-muted-foreground">Свяжитесь с нами</p>
        </div>
        {canEdit && (
          <Button onClick={() => {
            setEditContent(content);
            setShowEditor(!showEditor);
          }}>
            <Icon name={showEditor ? 'X' : 'Edit'} className="h-4 w-4 mr-2" />
            {showEditor ? 'Отмена' : 'Редактировать'}
          </Button>
        )}
      </div>

      {showEditor && canEdit ? (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Редактировать контакты поддержки</h2>
          <form onSubmit={handleSaveSupport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Контактная информация *</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Введите контактную информацию. Для ссылок используйте: [текст](ссылка)"
                rows={12}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Используйте [текст ссылки](https://example.com) для вставки ссылок
              </p>
            </div>

            <Button type="submit" className="w-full">
              <Icon name="Save" className="h-4 w-4 mr-2" />
              Сохранить контакты
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon name="MessageCircle" className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Свяжитесь с нами</h2>
              <p className="text-muted-foreground">Мы всегда готовы помочь</p>
            </div>
          </div>
          
          <div className="text-lg whitespace-pre-wrap">
            {renderContent(content)}
          </div>
        </Card>
      )}

      <Card className="p-6 bg-primary/5">
        <div className="flex items-start gap-4">
          <Icon name="Info" className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold mb-2">Важная информация</h3>
            <p className="text-sm text-muted-foreground">
              При обращении в службу поддержки, пожалуйста, укажите ваш никнейм и подробное описание проблемы. 
              Мы постараемся ответить как можно скорее.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
