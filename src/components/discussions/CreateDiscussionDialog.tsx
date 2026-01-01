import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CreateDiscussionDialogProps {
  show: boolean;
  title: string;
  content: string;
  loading: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

export default function CreateDiscussionDialog({
  show,
  title,
  content,
  loading,
  onTitleChange,
  onContentChange,
  onCreate,
  onClose,
}: CreateDiscussionDialogProps) {
  if (!show) return null;

  return (
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
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Содержание</label>
            <Textarea
              placeholder="Опишите тему обсуждения..."
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button onClick={onCreate} disabled={loading}>
              {loading ? 'Создание...' : 'Создать'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
