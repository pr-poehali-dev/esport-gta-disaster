import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UserRoleBadge from '@/components/UserRoleBadge';

interface Post {
  id: number;
  author: {
    nickname: string;
    avatar_url: string | null;
    role: string;
    auto_status: string;
    signature_url: string | null;
  };
  content: string;
  font_family: string;
  images: string[];
  created_at: string;
  edited_at: string | null;
}

interface Topic {
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
}

export default function ForumTopic() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [newPostContent, setNewPostContent] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const mockTopic: Topic = {
    id: 1,
    title: slug === 'forum-rules-and-recommendations' 
      ? 'Правила форума и рекомендации' 
      : 'Анонс турнира DISASTER CUP 2025',
    slug: slug || '',
    author: {
      nickname: 'Admin',
      avatar_url: null,
      role: 'admin',
      auto_status: 'Киберспортсмен'
    },
    is_closed: false,
    is_pinned: true,
    views_count: 1247,
    posts_count: 3,
    created_at: new Date().toISOString()
  };

  const mockPosts: Post[] = [
    {
      id: 1,
      author: {
        nickname: 'Admin',
        avatar_url: null,
        role: 'admin',
        auto_status: 'Киберспортсмен',
        signature_url: null
      },
      content: slug === 'forum-rules-and-recommendations'
        ? 'Добро пожаловать на форум DISASTER ESPORTS!\n\nПросьба соблюдать правила:\n1. Будьте вежливы и уважайте других участников\n2. Не используйте ненормативную лексику\n3. Соблюдайте тематику обсуждений\n4. Не создавайте дубликаты тем'
        : 'Объявляем о старте регистрации на DISASTER CUP 2025!\n\nПризовой фонд: $100,000\nДата старта: 15 января 2025\n\nРегистрируйте свои команды на сайте в разделе "Турниры".',
      font_family: 'Inter',
      images: [],
      created_at: new Date().toISOString(),
      edited_at: null
    },
    {
      id: 2,
      author: {
        nickname: 'User123',
        avatar_url: null,
        role: 'user',
        auto_status: 'Пользователь',
        signature_url: null
      },
      content: 'Отличная тема! Спасибо за информацию.',
      font_family: 'Inter',
      images: [],
      created_at: new Date().toISOString(),
      edited_at: null
    }
  ];

  const [topic] = useState<Topic>(mockTopic);
  const [posts, setPosts] = useState<Post[]>(mockPosts);

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

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'Новичок': 'bg-gradient-to-r from-slate-500 to-gray-600',
      'Пользователь': 'bg-gradient-to-r from-green-500 to-emerald-600',
      'Освоившийся': 'bg-gradient-to-r from-blue-500 to-cyan-600',
      'Киберспортсмен': 'bg-gradient-to-r from-purple-500 to-pink-600'
    };
    return colors[status] || colors['Новичок'];
  };

  const handleCreatePost = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (topic.is_closed && !isAdmin) {
      return;
    }

    const newPost: Post = {
      id: posts.length + 1,
      author: {
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        role: user.role,
        auto_status: user.auto_status || 'Новичок',
        signature_url: user.signature_url
      },
      content: newPostContent,
      font_family: fontFamily,
      images: [],
      created_at: new Date().toISOString(),
      edited_at: null
    };

    setPosts([...posts, newPost]);
    setNewPostContent('');
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  const fontOptions = [
    'Inter',
    'Arial',
    'Georgia',
    'Courier New',
    'Verdana',
    'Times New Roman',
    'Comic Sans MS'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/forum')}
          className="mb-6"
        >
          <Icon name="ArrowLeft" size={20} className="mr-2" />
          Назад к форуму
        </Button>

        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {topic.is_pinned && (
                  <Icon name="Pin" size={20} className="text-primary" />
                )}
                {topic.is_closed && (
                  <Icon name="Lock" size={20} className="text-muted-foreground" />
                )}
              </div>
              <h1 className="text-3xl font-black mb-4">{topic.title}</h1>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Icon name="Edit" size={16} className="mr-1" />
                  Редактировать
                </Button>
                <Button size="sm" variant="outline">
                  {topic.is_closed ? <Icon name="Unlock" size={16} /> : <Icon name="Lock" size={16} />}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="User" size={16} />
              <span>{topic.author.nickname}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="Eye" size={16} />
              <span>{topic.views_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="MessageSquare" size={16} />
              <span>{topic.posts_count}</span>
            </div>
            <span>{new Date(topic.created_at).toLocaleDateString('ru-RU')}</span>
          </div>
        </Card>

        <div className="space-y-6 mb-8">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-48 space-y-3">
                  {post.author.avatar_url ? (
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.nickname}
                      className="w-24 h-24 rounded-full mx-auto border-2 border-primary"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                      <Icon name="User" size={32} />
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="font-bold mb-2">{post.author.nickname}</div>
                    <UserRoleBadge 
                      role={post.author.role} 
                      autoStatus={post.author.auto_status}
                      showIcon={false}
                    />
                  </div>

                  {post.author.signature_url && (
                    <div className="mt-3">
                      {post.author.signature_url.endsWith('.mp4') || post.author.signature_url.endsWith('.webm') ? (
                        <video src={post.author.signature_url} className="w-full rounded" autoPlay loop muted />
                      ) : (
                        <img src={post.author.signature_url} alt="Подпись" className="w-full rounded" />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(post.created_at).toLocaleString('ru-RU')}
                      {post.edited_at && ' • Отредактировано'}
                    </div>
                    <div 
                      className="whitespace-pre-wrap"
                      style={{ fontFamily: post.font_family }}
                    >
                      {post.content}
                    </div>

                    {post.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {post.images.map((img, idx) => (
                          <img key={idx} src={img} alt="" className="rounded border border-border" />
                        ))}
                      </div>
                    )}
                  </div>

                  {user && (user.id === post.author.id || isAdmin) && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditPost(post)}>
                        <Icon name="Edit" size={14} className="mr-1" />
                        Редактировать
                      </Button>
                      {isAdmin && (
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                          <Icon name="Trash2" size={14} className="mr-1" />
                          Удалить
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {!topic.is_closed || isAdmin ? (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Написать ответ</h3>
            
            {!user ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Войдите, чтобы оставить комментарий</p>
                <Button onClick={() => navigate('/login')}>Войти</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ваше сообщение</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded focus:outline-none focus:border-primary transition-colors min-h-[150px]"
                    placeholder="Введите ваше сообщение..."
                    style={{ fontFamily }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium mr-2">Шрифт:</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="px-3 py-2 bg-background border border-border rounded"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    Отправить
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Эта тема закрыта для обсуждения</p>
          </Card>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать сообщение</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                defaultValue={editingPost?.content}
                className="w-full px-4 py-3 bg-background border border-border rounded focus:outline-none focus:border-primary transition-colors min-h-[150px]"
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Отмена
                </Button>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  Сохранить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}