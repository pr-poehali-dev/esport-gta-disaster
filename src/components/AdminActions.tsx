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

export default function AdminActions({ username, userId }: AdminActionsProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const [banDays, setBanDays] = useState('7');
  const [banReason, setBanReason] = useState('');
  const [muteDays, setMuteDays] = useState('3');
  const [muteReason, setMuteReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  
  const [pendingAction, setPendingAction] = useState<'ban' | 'mute' | 'suspend' | null>(null);
  
  const { toast } = useToast();

  const handleBanClick = () => {
    setPendingAction('ban');
    setConfirmDialogOpen(true);
  };

  const handleMuteClick = () => {
    setPendingAction('mute');
    setConfirmDialogOpen(true);
  };

  const handleSuspendClick = () => {
    setPendingAction('suspend');
    setConfirmDialogOpen(true);
  };

  const executeAction = () => {
    if (pendingAction === 'ban') {
      toast({
        title: 'Бан выдан',
        description: `${username} забанен на ${banDays === 'forever' ? 'навсегда' : `${banDays} дней`}`,
      });
      setBanDialogOpen(false);
      setBanDays('7');
      setBanReason('');
    } else if (pendingAction === 'mute') {
      toast({
        title: 'Мут выдан',
        description: `${username} замучен на ${muteDays} дней`,
      });
      setMuteDialogOpen(false);
      setMuteDays('3');
      setMuteReason('');
    } else if (pendingAction === 'suspend') {
      toast({
        title: 'Отстранение выполнено',
        description: `${username} отстранен от турнира`,
      });
      setSuspendDialogOpen(false);
      setSuspendReason('');
      setSelectedTournament('');
    }
    setConfirmDialogOpen(false);
    setPendingAction(null);
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
              disabled={!banReason.trim()}
            >
              Подтвердить Бан
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
              disabled={!muteReason.trim()}
            >
              Подтвердить Мут
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
                  <SelectItem value="cs2-championship">CS2 Championship 2025</SelectItem>
                  <SelectItem value="valorant-cup">Valorant Spring Cup</SelectItem>
                  <SelectItem value="dota2-league">Dota 2 League</SelectItem>
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
              disabled={!suspendReason.trim() || !selectedTournament}
            >
              Подтвердить Отстранение
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Icon name="AlertTriangle" size={24} />
              Подтверждение Действия
            </DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите выполнить это действие?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-2">
            <p className="text-sm">
              <strong>Пользователь:</strong> {username}
            </p>
            {pendingAction === 'ban' && (
              <>
                <p className="text-sm">
                  <strong>Действие:</strong> Бан на {banDays === 'forever' ? 'навсегда' : `${banDays} дней`}
                </p>
                <p className="text-sm">
                  <strong>Причина:</strong> {banReason}
                </p>
              </>
            )}
            {pendingAction === 'mute' && (
              <>
                <p className="text-sm">
                  <strong>Действие:</strong> Мут на {muteDays} дней
                </p>
                <p className="text-sm">
                  <strong>Причина:</strong> {muteReason}
                </p>
              </>
            )}
            {pendingAction === 'suspend' && (
              <>
                <p className="text-sm">
                  <strong>Действие:</strong> Отстранение от турнира
                </p>
                <p className="text-sm">
                  <strong>Причина:</strong> {suspendReason}
                </p>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={executeAction}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
