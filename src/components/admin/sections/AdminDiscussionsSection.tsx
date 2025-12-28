import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function AdminDiscussionsSection() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canModerate = ['founder', 'organizer', 'admin', 'moderator'].includes(user.role);

  useEffect(() => {
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_discussions' }),
      });

      const data = await response.json();
      if (data.discussions) {
        setDiscussions(data.discussions);
      }
    } catch (error) {
      console.error('Ошибка загрузки обсуждений:', error);
    }
  };

  const loadDiscussion = async (id: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({ action: 'get_discussion', discussion_id: id }),
      });

      const data = await response.json();
      if (data.discussion) {
        setSelectedDiscussion(data.discussion);
      }
    } catch (error) {
      console.error('Ошибка загрузки обсуждения:', error);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните заголовок и содержание',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'create_discussion',
          title: newTitle,
          content: newContent,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        setNewTitle('');
        setNewContent('');
        setIsCreateDialogOpen(false);
        loadDiscussions();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать обсуждение',
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

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedDiscussion) return;

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'add_comment',
          discussion_id: selectedDiscussion.id,
          content: commentText,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        setCommentText('');
        loadDiscussion(selectedDiscussion.id);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось добавить комментарий',
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

  const handleToggleLock = async (id: number, currentLock: boolean) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'lock_discussion',
          discussion_id: id,
          lock: !currentLock,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadDiscussions();
        if (selectedDiscussion?.id === id) {
          loadDiscussion(id);
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleTogglePin = async (id: number, currentPin: boolean) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'pin_discussion',
          discussion_id: id,
          pin: !currentPin,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadDiscussions();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!canModerate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Обсуждения</CardTitle>
          <CardDescription>Только модераторы могут просматривать обсуждения</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">У вас нет прав для просмотра этого раздела.</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedDiscussion) {
    return (
      <div className="space-y-6">
        <Button onClick={() => setSelectedDiscussion(null)} variant="ghost">
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад к списку
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {selectedDiscussion.is_pinned && <Icon name="Pin" size={20} className="text-yellow-500" />}
                  {selectedDiscussion.is_locked && <Icon name="Lock" size={20} className="text-red-500" />}
                  {selectedDiscussion.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <img
                    src={selectedDiscussion.author_avatar || '/default-avatar.png'}
                    alt={selectedDiscussion.author_name}
                    className="w-6 h-6 rounded-full"
                  />
                  {selectedDiscussion.author_name} •{' '}
                  {new Date(selectedDiscussion.created_at).toLocaleString('ru-RU')}
                </CardDescription>
              </div>
              {canModerate && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleLock(selectedDiscussion.id, selectedDiscussion.is_locked)}
                  >
                    <Icon name={selectedDiscussion.is_locked ? 'Unlock' : 'Lock'} size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePin(selectedDiscussion.id, selectedDiscussion.is_pinned)}
                  >
                    <Icon name="Pin" size={16} />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{selectedDiscussion.content}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Комментарии ({selectedDiscussion.comments?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDiscussion.comments?.map((comment: any) => (
              <div key={comment.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={comment.author_avatar || '/default-avatar.png'}
                    alt={comment.author_name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-medium text-sm">{comment.author_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}

            {(!selectedDiscussion.is_locked || canModerate) && (
              <div className="space-y-2">
                <Label>Добавить комментарий</Label>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ваш комментарий..."
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={loading}>
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" size={24} />
              Обсуждения модераторов
            </CardTitle>
            <CardDescription>Внутренний форум для обсуждения</CardDescription>
          </div>
          {canModerate && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать тему
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новая тема обсуждения</DialogTitle>
                  <DialogDescription>Создайте новую тему для обсуждения</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Заголовок</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Введите заголовок..."
                    />
                  </div>
                  <div>
                    <Label>Содержание</Label>
                    <Textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Опишите тему обсуждения..."
                      rows={5}
                    />
                  </div>
                  <Button onClick={handleCreateDiscussion} disabled={loading}>
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discussions.map((disc) => (
              <Card
                key={disc.id}
                className="cursor-pointer hover:border-primary transition"
                onClick={() => loadDiscussion(disc.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <img
                        src={disc.author_avatar || '/default-avatar.png'}
                        alt={disc.author_name}
                        className="w-10 h-10 rounded-full mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold flex items-center gap-2">
                          {disc.is_pinned && <Icon name="Pin" size={16} className="text-yellow-500" />}
                          {disc.is_locked && <Icon name="Lock" size={16} className="text-red-500" />}
                          {disc.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{disc.content}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>{disc.author_name}</span>
                          <span>•</span>
                          <span>{disc.comment_count} комментариев</span>
                          <span>•</span>
                          <span>{disc.views} просмотров</span>
                          <span>•</span>
                          <span>{new Date(disc.updated_at).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>
                    </div>
                    {canModerate && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLock(disc.id, disc.is_locked);
                          }}
                        >
                          <Icon name={disc.is_locked ? 'Unlock' : 'Lock'} size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(disc.id, disc.is_pinned);
                          }}
                        >
                          <Icon name="Pin" size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
