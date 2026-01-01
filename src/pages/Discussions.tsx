import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function Discussions() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
      return;
    }
    loadDiscussions();
  }, []);

  const loadDiscussions = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
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
          'X-Admin-Id': user.id.toString(),
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedDiscussion) return;

    setLoading(true);
    try {
      let imageBase64 = null;
      if (selectedImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(selectedImage);
        });
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'add_comment',
          discussion_id: selectedDiscussion.id,
          content: commentText,
          image_base64: imageBase64,
          image_filename: selectedImage?.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        setCommentText('');
        setSelectedImage(null);
        setImagePreview('');
        loadDiscussion(selectedDiscussion.id);
        loadDiscussions();
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

  const handleCreateDiscussion = async () => {
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
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
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'create_discussion',
          title: newDiscussionTitle,
          content: newDiscussionContent,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        setShowCreateDialog(false);
        setNewDiscussionTitle('');
        setNewDiscussionContent('');
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

  const handleTogglePin = async (discussionId: number, currentPinned: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: currentPinned ? 'unpin_discussion' : 'pin_discussion',
          discussion_id: discussionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: currentPinned ? 'Обсуждение откреплено' : 'Обсуждение закреплено',
        });
        loadDiscussion(discussionId);
        loadDiscussions();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить статус',
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

  const handleToggleLock = async (discussionId: number, currentLocked: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: currentLocked ? 'unlock_discussion' : 'lock_discussion',
          discussion_id: discussionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: currentLocked ? 'Обсуждение разблокировано' : 'Обсуждение заблокировано',
        });
        loadDiscussion(discussionId);
        loadDiscussions();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить статус',
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

  const filteredDiscussions = discussions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.author_nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = ['admin', 'founder', 'organizer'].includes(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Обсуждения</h1>
              <p className="text-muted-foreground">Участвуйте в обсуждениях сообщества</p>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать обсуждение
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Темы обсуждений</CardTitle>
                <CardDescription>Выберите тему для просмотра</CardDescription>
                <div className="mt-4">
                  <Input
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredDiscussions.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Search" className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Обсуждения не найдены</p>
                  </div>
                ) : (
                  filteredDiscussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                        selectedDiscussion?.id === discussion.id 
                          ? 'bg-accent border-primary shadow-sm' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => loadDiscussion(discussion.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {discussion.is_pinned && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              <Icon name="Pin" className="h-3 w-3" />
                              Закреплено
                            </div>
                          )}
                          {discussion.is_locked && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                              <Icon name="Lock" className="h-3 w-3" />
                              Закрыто
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">{discussion.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="User" className="h-3 w-3" />
                            {discussion.author_nickname}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="MessageSquare" className="h-3 w-3" />
                            {discussion.comments_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {!selectedDiscussion ? (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon name="MessageSquare" className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Выберите обсуждение</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Нажмите на тему из списка слева, чтобы просмотреть детали и комментарии
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="border-b">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-wrap">
                        {selectedDiscussion.is_pinned && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                            <Icon name="Pin" className="h-3.5 w-3.5" />
                            Закреплено
                          </div>
                        )}
                        {selectedDiscussion.is_locked && (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                            <Icon name="Lock" className="h-3.5 w-3.5" />
                            Закрыто
                          </div>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTogglePin(selectedDiscussion.id, selectedDiscussion.is_pinned)}
                            disabled={loading}
                          >
                            <Icon name={selectedDiscussion.is_pinned ? "PinOff" : "Pin"} size={14} className="mr-1" />
                            {selectedDiscussion.is_pinned ? 'Открепить' : 'Закрепить'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleLock(selectedDiscussion.id, selectedDiscussion.is_locked)}
                            disabled={loading}
                          >
                            <Icon name={selectedDiscussion.is_locked ? "Unlock" : "Lock"} size={14} className="mr-1" />
                            {selectedDiscussion.is_locked ? 'Разблокировать' : 'Заблокировать'}
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{selectedDiscussion.title}</CardTitle>
                      <CardDescription className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1.5">
                          <Icon name="User" className="h-3.5 w-3.5" />
                          {selectedDiscussion.author_nickname}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon name="Calendar" className="h-3.5 w-3.5" />
                          {new Date(selectedDiscussion.created_at).toLocaleString('ru-RU')}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="p-5 bg-muted/50 rounded-lg border">
                    <p className="whitespace-pre-wrap leading-relaxed">{selectedDiscussion.content}</p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Icon name="MessageSquare" className="h-5 w-5" />
                      Комментарии
                      <span className="text-sm font-normal text-muted-foreground">({selectedDiscussion.comments?.length || 0})</span>
                    </h3>

                    <div className="space-y-3 mb-6">
                      {selectedDiscussion.comments?.length === 0 ? (
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                          <Icon name="MessageCircle" className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground text-sm">Комментариев пока нет. Будьте первым!</p>
                        </div>
                      ) : (
                        selectedDiscussion.comments?.map((comment: any) => (
                          <div key={comment.id} className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Icon name="User" className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm font-semibold">{comment.author_nickname}</p>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Icon name="Clock" className="h-3 w-3" />
                                {new Date(comment.created_at).toLocaleString('ru-RU')}
                              </p>
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed pl-10">{comment.content}</p>
                            {comment.image_url && (
                              <div className="mt-3 pl-10">
                                <img 
                                  src={comment.image_url} 
                                  alt="Прикрепленное изображение" 
                                  className="rounded-lg max-w-md max-h-96 object-contain border"
                                  loading="lazy"
                                />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {!selectedDiscussion.is_locked ? (
                      <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Icon name="Edit3" className="h-4 w-4" />
                          Новый комментарий
                        </label>
                        <Textarea
                          placeholder="Напишите свой комментарий..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                        
                        {imagePreview && (
                          <div className="relative inline-block">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="rounded-lg max-h-32 object-contain border"
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview('');
                              }}
                            >
                              <Icon name="X" className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div>
                            <input
                              type="file"
                              id="image-upload"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageSelect}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('image-upload')?.click()}
                            >
                              <Icon name="Image" className="h-4 w-4 mr-2" />
                              Прикрепить фото
                            </Button>
                          </div>
                          <Button onClick={handleAddComment} disabled={loading || !commentText.trim()}>
                            <Icon name="Send" className="h-4 w-4 mr-2" />
                            Отправить
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-muted/50 rounded-lg border text-center">
                        <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                          <Icon name="Lock" className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium mb-1">Обсуждение закрыто</p>
                        <p className="text-xs text-muted-foreground">
                          Новые комментарии добавлять нельзя
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Создать обсуждение</CardTitle>
              <CardDescription>Новая тема для обсуждения сообществом</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название</label>
                <Input
                  placeholder="Введите название обсуждения..."
                  value={newDiscussionTitle}
                  onChange={(e) => setNewDiscussionTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Содержание</label>
                <Textarea
                  placeholder="Опишите тему обсуждения..."
                  value={newDiscussionContent}
                  onChange={(e) => setNewDiscussionContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setNewDiscussionTitle('');
                    setNewDiscussionContent('');
                  }}
                  disabled={loading}
                >
                  Отмена
                </Button>
                <Button onClick={handleCreateDiscussion} disabled={loading}>
                  {loading ? 'Создание...' : 'Создать'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}