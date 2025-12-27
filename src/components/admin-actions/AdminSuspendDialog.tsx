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

interface AdminSuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  selectedTournament: string;
  setSelectedTournament: (tournament: string) => void;
  suspendReason: string;
  setSuspendReason: (reason: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function AdminSuspendDialog({
  open,
  onOpenChange,
  username,
  selectedTournament,
  setSelectedTournament,
  suspendReason,
  setSuspendReason,
  onConfirm,
  loading,
}: AdminSuspendDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отстранить от Турнира</DialogTitle>
          <DialogDescription>
            Вы отстраняете пользователя <strong>{username}</strong> от участия в турнире
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tournament">Турнир</Label>
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger id="tournament">
                <SelectValue placeholder="Выберите турнир" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">CS2 Championship 2025</SelectItem>
                <SelectItem value="2">Valorant Spring Cup</SelectItem>
                <SelectItem value="3">Dota 2 League</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Причина отстранения</Label>
            <Textarea
              id="suspend-reason"
              placeholder="Опишите причину отстранения от турнира..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
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
            disabled={!suspendReason.trim() || !selectedTournament || loading}
          >
            {loading ? 'Отправка...' : 'Подтвердить Отстранение'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
