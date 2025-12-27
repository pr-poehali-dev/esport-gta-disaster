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

interface AdminBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  banDays: string;
  setBanDays: (days: string) => void;
  banReason: string;
  setBanReason: (reason: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function AdminBanDialog({
  open,
  onOpenChange,
  username,
  banDays,
  setBanDays,
  banReason,
  setBanReason,
  onConfirm,
  loading,
}: AdminBanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выдать Бан</DialogTitle>
          <DialogDescription>
            Вы выдаете бан пользователю <strong>{username}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ban-duration">Срок бана</Label>
            <Select value={banDays} onValueChange={setBanDays}>
              <SelectTrigger id="ban-duration">
                <SelectValue placeholder="Выберите срок" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 день</SelectItem>
                <SelectItem value="3">3 дня</SelectItem>
                <SelectItem value="7">7 дней</SelectItem>
                <SelectItem value="14">14 дней</SelectItem>
                <SelectItem value="30">30 дней</SelectItem>
                <SelectItem value="forever">Навсегда</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ban-reason">Причина бана</Label>
            <Textarea
              id="ban-reason"
              placeholder="Опишите причину выдачи бана..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!banReason.trim() || loading}
          >
            {loading ? 'Отправка...' : 'Подтвердить Бан'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
