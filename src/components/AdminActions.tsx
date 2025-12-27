import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AdminActionsProps {
  username: string;
  userId: string;
}

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function AdminActions({ username, userId }: AdminActionsProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  
  const [banDays, setBanDays] = useState('7');
  const [banReason, setBanReason] = useState('');
  const [muteDays, setMuteDays] = useState('3');
  const [muteReason, setMuteReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingAction, setPendingAction] = useState<'ban' | 'mute' | 'suspend' | null>(null);
  const [pendingActionData, setPendingActionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const getAdminId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const sendVerificationCode = async (actionType: string, actionData: any) => {
    setLoading(true);
    const adminId = getAdminId();
    
    if (!adminId) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось определить ID администратора',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'send_verification_code',
          action_type: actionType,
          action_data: actionData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Код отправлен',
          description: data.message,
        });
        setPendingAction(actionType as any);
        setPendingActionData(actionData);
        setEmailVerificationOpen(true);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить код',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка отправки кода',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndExecute = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Ошибка',
        description: 'Введите 6-значный код',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'verify_and_execute',
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        
        setEmailVerificationOpen(false);
        setVerificationCode('');
        
        if (pendingAction === 'ban') {
          setBanDialogOpen(false);
          setBanDays('7');
          setBanReason('');
        } else if (pendingAction === 'mute') {
          setMuteDialogOpen(false);
          setMuteDays('3');
          setMuteReason('');
        } else if (pendingAction === 'suspend') {
          setSuspendDialogOpen(false);
          setSuspendReason('');
          setSelectedTournament('');
        }
        
        setPendingAction(null);
        setPendingActionData(null);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось выполнить действие',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка выполнения действия',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanClick = () => {
    if (!banReason.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину бана',
        variant: 'destructive',
      });
      return;
    }

    const actionData = {
      user_id: userId,
      reason: banReason,
      duration_days: banDays === 'forever' ? null : banDays,
      is_permanent: banDays === 'forever',
    };

    sendVerificationCode('ban', actionData);
  };

  const handleMuteClick = () => {
    if (!muteReason.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину мута',
        variant: 'destructive',
      });
      return;
    }

    const actionData = {
      user_id: userId,
      reason: muteReason,
      duration_days: muteDays,
      is_permanent: false,
    };

    sendVerificationCode('mute', actionData);
  };

  const handleSuspendClick = () => {
    if (!suspendReason.trim() || !selectedTournament) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const actionData = {
      user_id: userId,
      tournament_id: selectedTournament,
      reason: suspendReason,
    };

    sendVerificationCode('suspend', actionData);
  };

  return (
    <>
      <Card className="p-6 space-y-4 border-2 border-primary/30">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Shield" size={24} className="text-primary" />
          <h3 className="text-xl font-bold">Административные Действия</h3>
        </div>

        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={() => setBanDialogOpen(true)}
        >
          <Icon name="Ban" size={20} className="mr-2" />
          Выдать Бан
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start border-orange-500/50 hover:bg-orange-500/10"
          onClick={() => setMuteDialogOpen(true)}
        >
          <Icon name="VolumeX" size={20} className="mr-2" />
          Замутить в Обсуждениях
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start border-yellow-500/50 hover:bg-yellow-500/10"
          onClick={() => setSuspendDialogOpen(true)}
        >
          <Icon name="UserX" size={20} className="mr-2" />
          Отстранить от Турнира
        </Button>

        <div className="pt-4 border-t border-border space-y-2">
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Edit" size={20} className="mr-2" />
            Изменить Роль
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Mail" size={20} className="mr-2" />
            Отправить Сообщение
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icon name="Eye" size={20} className="mr-2" />
            История Действий
          </Button>
        </div>
      </Card>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
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
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanClick}
              disabled={!banReason.trim() || loading}
            >
              {loading ? 'Отправка...' : 'Подтвердить Бан'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={muteDialogOpen} onOpenChange={setMuteDialogOpen}>
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
            <Button variant="outline" onClick={() => setMuteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleMuteClick}
              disabled={!muteReason.trim() || loading}
            >
              {loading ? 'Отправка...' : 'Подтвердить Мут'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
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
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleSuspendClick}
              disabled={!suspendReason.trim() || !selectedTournament || loading}
            >
              {loading ? 'Отправка...' : 'Подтвердить Отстранение'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailVerificationOpen} onOpenChange={setEmailVerificationOpen}>
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
                setEmailVerificationOpen(false);
                setVerificationCode('');
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={verifyAndExecute}
              disabled={verificationCode.length !== 6 || loading}
            >
              {loading ? 'Проверка...' : 'Подтвердить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
