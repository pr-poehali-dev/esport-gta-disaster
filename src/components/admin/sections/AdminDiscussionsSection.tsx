import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DiscussionList from './discussions/DiscussionList';
import DiscussionDetail from './discussions/DiscussionDetail';
import CreateDiscussionDialog from './discussions/CreateDiscussionDialog';
import EditDiscussionDialog from './discussions/EditDiscussionDialog';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function AdminDiscussionsSection() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingDiscussionId, setEditingDiscussionId] = useState<number | null>(null);
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
          'X-Admin-Id': user.id.toString(),
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

  const handleAddComment = async (imageFile?: File | null) => {
    if (!commentText.trim() || !selectedDiscussion) return;

    setLoading(true);
    try {
      let imageBase64 = null;
      let imageFilename = null;
      
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(imageFile);
        });
        imageFilename = imageFile.name;
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
          image_filename: imageFilename,
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

  const handleToggleLock = async (id: number, currentLock: boolean) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
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
          'X-Admin-Id': user.id.toString(),
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

  const handleDeleteDiscussion = async (id: number) => {
    if (!['admin', 'founder', 'organizer'].includes(user.role)) {
      toast({
        title: 'Ошибка',
        description: 'Только администратор и выше может удалять обсуждения',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Вы уверены, что хотите удалить это обсуждение? Действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'delete_discussion',
          discussion_id: id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        if (selectedDiscussion?.id === id) {
          setSelectedDiscussion(null);
        }
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

  const handleEditDiscussion = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
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
          'X-Admin-Id': user.id.toString(),
        },
        body: JSON.stringify({
          action: 'update_discussion',
          discussion_id: editingDiscussionId,
          title: editTitle,
          content: editContent,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        setEditTitle('');
        setEditContent('');
        setEditingDiscussionId(null);
        setIsEditDialogOpen(false);
        loadDiscussions();
        if (selectedDiscussion?.id === editingDiscussionId) {
          loadDiscussion(editingDiscussionId);
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обновить обсуждение',
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

  const openEditDialog = (discussion: any) => {
    setEditingDiscussionId(discussion.id);
    setEditTitle(discussion.title);
    setEditContent(discussion.content);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DiscussionList
          discussions={discussions}
          selectedDiscussion={selectedDiscussion}
          onSelectDiscussion={loadDiscussion}
          onTogglePin={handleTogglePin}
          onToggleLock={handleToggleLock}
          onEditDiscussion={openEditDialog}
          onDeleteDiscussion={handleDeleteDiscussion}
          onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
          canModerate={canModerate}
          userRole={user.role}
        />

        <DiscussionDetail
          selectedDiscussion={selectedDiscussion}
          commentText={commentText}
          setCommentText={setCommentText}
          onAddComment={handleAddComment}
          loading={loading}
          canModerate={canModerate}
        />
      </div>

      <CreateDiscussionDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newContent={newContent}
        setNewContent={setNewContent}
        onSubmit={handleCreateDiscussion}
        loading={loading}
      />

      <EditDiscussionDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editContent={editContent}
        setEditContent={setEditContent}
        onSubmit={handleEditDiscussion}
        loading={loading}
      />
    </div>
  );
}