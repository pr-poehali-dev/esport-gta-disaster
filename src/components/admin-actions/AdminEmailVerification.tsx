import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AdminEmailVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function AdminEmailVerification({
  open,
  onOpenChange,
  verificationCode,
  setVerificationCode,
  onConfirm,
  loading,
}: AdminEmailVerificationProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Mail" size={24} className="text-primary" />
            Подтверждение по Email
          </DialogTitle>
          <DialogDescription>
            Код подтверждения отправлен на ваш email. Введите его для выполнения действия.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Код подтверждения</Label>
            <Input
              id="verification-code"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest"
            />
            <p className="text-xs text-muted-foreground text-center">
              Введите 6-значный код из письма
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              setVerificationCode('');
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            disabled={verificationCode.length !== 6 || loading}
          >
            {loading ? 'Проверка...' : 'Подтвердить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
