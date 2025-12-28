import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface CreateDiscussionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newTitle: string;
  setNewTitle: (title: string) => void;
  newContent: string;
  setNewContent: (content: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function CreateDiscussionDialog({
  isOpen,
  onOpenChange,
  newTitle,
  setNewTitle,
  newContent,
  setNewContent,
  onSubmit,
  loading,
}: CreateDiscussionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать новое обсуждение</DialogTitle>
          <DialogDescription>Создайте новую тему для обсуждения</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Введите заголовок"
            />
          </div>
          <div>
            <Label htmlFor="content">Содержание</Label>
            <Textarea
              id="content"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Введите текст обсуждения"
              rows={5}
            />
          </div>
          <Button onClick={onSubmit} disabled={loading} className="w-full">
            <Icon name="Plus" className="h-4 w-4 mr-2" />
            Создать обсуждение
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
