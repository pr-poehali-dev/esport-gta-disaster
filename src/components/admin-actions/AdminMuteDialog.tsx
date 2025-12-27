import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdminMuteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  muteDays: string;
  setMuteDays: (days: string) => void;
  muteReason: string;
  setMuteReason: (reason: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function AdminMuteDialog({
  open,
  onOpenChange,
  username,
  muteDays,
  setMuteDays,
  muteReason,
  setMuteReason,
  onConfirm,
  loading,
}: AdminMuteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выдать Мут</DialogTitle>
          <DialogDescription>
            Вы выдаете мут пользователю <strong>{username}</strong> в обсуждениях
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mute-duration">Срок мута</Label>
            <Select value={muteDays} onValueChange={setMuteDays}>
              <SelectTrigger id="mute-duration">
                <SelectValue placeholder="Выберите срок" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 день</SelectItem>
                <SelectItem value="3">3 дня</SelectItem>
                <SelectItem value="7">7 дней</SelectItem>
                <SelectItem value="14">14 дней</SelectItem>
                <SelectItem value="30">30 дней</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mute-reason">Причина мута</Label>
            <Textarea
              id="mute-reason"
              placeholder="Опишите причину выдачи мута..."
              value={muteReason}
              onChange={(e) => setMuteReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!muteReason.trim() || loading}
          >
            {loading ? 'Отправка...' : 'Подтвердить Мут'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
