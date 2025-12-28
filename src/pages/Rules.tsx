import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface Rule {
  id: number;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
  author_name: string;
}

export default function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    order_index: 0
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const userId = user?.id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').id : '');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({ action: 'get_rules' })
      });

      const data = await response.json();
      
      if (response.ok) {
        setRules(data.rules || []);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
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
          action: editingRule ? 'update_rule' : 'create_rule',
          ...(editingRule ? { rule_id: editingRule.id } : {}),
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', editingRule ? 'Правило обновлено' : 'Правило создано');
        setShowEditor(false);
        setEditingRule(null);
        setFormData({ title: '', content: '', order_index: 0 });
        loadRules();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      title: rule.title,
      content: rule.content,
      order_index: rule.order_index
    });
    setShowEditor(true);
  };

  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
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
            className="text-primary hover:underline"
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

  const canEdit = user && ['admin', 'founder'].includes(user.role);

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
          <h1 className="text-3xl font-black">Правила проекта</h1>
          <p className="text-muted-foreground">Ознакомьтесь с правилами участия</p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowEditor(!showEditor)}>
            <Icon name={showEditor ? 'X' : 'Plus'} className="h-4 w-4 mr-2" />
            {showEditor ? 'Отмена' : 'Добавить правило'}
          </Button>
        )}
      </div>

      {showEditor && canEdit && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {editingRule ? 'Редактировать правило' : 'Новое правило'}
          </h2>
          <form onSubmit={handleSaveRule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Заголовок *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Название правила"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Содержание *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Текст правила. Для ссылок используйте: [текст](ссылка)"
                rows={8}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Используйте [текст ссылки](https://example.com) для вставки ссылок
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Порядок</label>
              <Input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <Button type="submit" className="w-full">
              <Icon name="Save" className="h-4 w-4 mr-2" />
              {editingRule ? 'Обновить правило' : 'Создать правило'}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <Card key={rule.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{rule.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Автор: {rule.author_name} • {new Date(rule.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
              {canEdit && (
                <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                  <Icon name="Edit" className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-muted-foreground whitespace-pre-wrap">
              {renderContent(rule.content)}
            </div>
          </Card>
        ))}
      </div>

      {rules.length === 0 && !showEditor && (
        <div className="text-center py-20">
          <Icon name="FileText" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">Правила не установлены</h3>
          <p className="text-muted-foreground">
            {canEdit ? 'Создайте первое правило' : 'Правила скоро появятся'}
          </p>
        </div>
      )}
    </div>
  );
}
