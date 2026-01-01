import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import DiscussionsList from '@/components/discussions/DiscussionsList';
import DiscussionDetail from '@/components/discussions/DiscussionDetail';
import CreateDiscussionDialog from '@/components/discussions/CreateDiscussionDialog';

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

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
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

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setNewDiscussionTitle('');
    setNewDiscussionContent('');
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
            <DiscussionsList
              discussions={discussions}
              selectedDiscussion={selectedDiscussion}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectDiscussion={loadDiscussion}
            />
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
              <DiscussionDetail
                discussion={selectedDiscussion}
                isAdmin={isAdmin}
                loading={loading}
                commentText={commentText}
                imagePreview={imagePreview}
                onCommentTextChange={setCommentText}
                onImageSelect={handleImageSelect}
                onRemoveImage={handleRemoveImage}
                onAddComment={handleAddComment}
                onTogglePin={handleTogglePin}
                onToggleLock={handleToggleLock}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />

      <CreateDiscussionDialog
        show={showCreateDialog}
        title={newDiscussionTitle}
        content={newDiscussionContent}
        loading={loading}
        onTitleChange={setNewDiscussionTitle}
        onContentChange={setNewDiscussionContent}
        onCreate={handleCreateDiscussion}
        onClose={handleCloseCreateDialog}
      />
    </div>
  );
}
