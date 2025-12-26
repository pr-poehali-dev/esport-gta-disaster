import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

interface DeleteTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  onDelete: () => void;
}

export default function DeleteTeamDialog({
  open,
  onOpenChange,
  teamName,
  onDelete,
}: DeleteTeamDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmation !== teamName) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
      onOpenChange(false);
      setConfirmation('');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmation('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={24} />
            Удаление команды
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p className="font-semibold text-foreground">
              Это действие необратимо!
            </p>
            <p>
              Будут удалены:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Вся информация о команде</li>
              <li>Состав команды (все игроки)</li>
              <li>Регистрации на турниры</li>
            </ul>
            <p className="text-sm">
              Для подтверждения введите название команды:{' '}
              <span className="font-bold text-foreground">{teamName}</span>
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="confirmation">Название команды</Label>
          <Input
            id="confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={teamName}
            className="font-mono"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmation !== teamName || isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить команду'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
