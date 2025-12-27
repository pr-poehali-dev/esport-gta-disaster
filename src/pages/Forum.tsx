import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ForumTopic {
  id: number;
  title: string;
  slug: string;
  author: {
    nickname: string;
    avatar_url: string | null;
    role: string;
    auto_status: string;
  };
  is_closed: boolean;
  is_pinned: boolean;
  views_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export default function Forum() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const navigate = useNavigate();

  const mockTopics: ForumTopic[] = [
    {
      id: 1,
      title: 'Правила форума и рекомендации',
      slug: 'forum-rules-and-recommendations',
      author: {
        nickname: 'Admin',
        avatar_url: null,
        role: 'admin',
        auto_status: 'Киберспортсмен'
      },
      is_closed: false,
      is_pinned: true,
      views_count: 1247,
      posts_count: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Анонс турнира DISASTER CUP 2025',
      slug: 'disaster-cup-2025-announcement',
      author: {
        nickname: 'Organizer',
        avatar_url: null,
        role: 'moderator',
        auto_status: 'Освоившийся'
      },
      is_closed: false,
      is_pinned: true,
      views_count: 856,
      posts_count: 24,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const [topics] = useState<ForumTopic[]>(mockTopics);

  const isAdmin = user && ['founder', 'director', 'admin', 'moderator'].includes(user.role);

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'founder': 'bg-gradient-to-r from-yellow-500 to-orange-500',
      'director': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'admin': 'bg-gradient-to-r from-red-500 to-pink-600',
      'moderator': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'chief_judge': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'legend': 'bg-gradient-to-r from-amber-500 to-yellow-600',
      'authority': 'bg-gradient-to-r from-indigo-500 to-purple-600',
      'user': 'bg-gradient-to-r from-gray-600 to-gray-700'
    };
    return colors[role] || colors['user'];
  };

  const handleCreateTopic = () => {
    console.log('Создание темы:', newTopicTitle, newTopicContent);
    setIsCreateDialogOpen(false);
    setNewTopicTitle('');
    setNewTopicContent('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">
              <span className="text-gradient">Обсуждения</span>
            </h1>
            <p className="text-muted-foreground">
              Обсуждайте игры, турниры и команды
            </p>
          </div>

          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Создать тему
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Создать новую тему</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Заголовок темы</label>
                    <input
                      type="text"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded focus:outline-none focus:border-primary transition-colors"
                      placeholder="Введите заголовок"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Содержание</label>
                    <textarea
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-border rounded focus:outline-none focus:border-primary transition-colors min-h-[200px]"
                      placeholder="Опишите тему подробнее..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleCreateTopic}
                      disabled={!newTopicTitle.trim() || !newTopicContent.trim()}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      Создать тему
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-4">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="p-6 hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => navigate(`/forum/${topic.slug}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {topic.is_pinned && (
                      <Icon name="Pin" size={16} className="text-primary" />
                    )}
                    {topic.is_closed && (
                      <Icon name="Lock" size={16} className="text-muted-foreground" />
                    )}
                    <h3 className="text-xl font-bold hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {topic.author.avatar_url ? (
                        <img
                          src={topic.author.avatar_url}
                          alt={topic.author.nickname}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Icon name="User" size={14} />
                        </div>
                      )}
                      <span className="font-medium">{topic.author.nickname}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${getRoleBadgeColor(topic.author.role)}`}>
                        {topic.author.role.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Icon name="Eye" size={16} />
                      <span>{topic.views_count}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Icon name="MessageSquare" size={16} />
                      <span>{topic.posts_count}</span>
                    </div>

                    <span>
                      {new Date(topic.updated_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                <Icon name="ChevronRight" size={20} className="text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>

        {topics.length === 0 && (
          <Card className="p-12 text-center">
            <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">Пока нет тем</h3>
            <p className="text-muted-foreground mb-4">
              {isAdmin ? 'Создайте первую тему для обсуждения' : 'Скоро здесь появятся темы'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
