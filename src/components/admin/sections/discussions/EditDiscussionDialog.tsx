import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface EditDiscussionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function EditDiscussionDialog({
  isOpen,
  onOpenChange,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  onSubmit,
  loading,
}: EditDiscussionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать обсуждение</DialogTitle>
          <DialogDescription>Измените заголовок и содержание обсуждения</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Заголовок</Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Введите заголовок"
            />
          </div>
          <div>
            <Label htmlFor="edit-content">Содержание</Label>
            <Textarea
              id="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Введите текст обсуждения"
              rows={5}
            />
          </div>
          <Button onClick={onSubmit} disabled={loading} className="w-full">
            <Icon name="Save" className="h-4 w-4 mr-2" />
            Сохранить изменения
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
