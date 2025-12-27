import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminActionsCardProps {
  onBanClick: () => void;
  onMuteClick: () => void;
  onSuspendClick: () => void;
}

export default function AdminActionsCard({ onBanClick, onMuteClick, onSuspendClick }: AdminActionsCardProps) {
  return (
    <Card className="p-6 space-y-4 border-2 border-primary/30">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Shield" size={24} className="text-primary" />
        <h3 className="text-xl font-bold">Административные Действия</h3>
      </div>

      <Button
        variant="destructive"
        className="w-full justify-start"
        onClick={onBanClick}
      >
        <Icon name="Ban" size={20} className="mr-2" />
        Выдать Бан
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start border-orange-500/50 hover:bg-orange-500/10"
        onClick={onMuteClick}
      >
        <Icon name="VolumeX" size={20} className="mr-2" />
        Замутить в Обсуждениях
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start border-yellow-500/50 hover:bg-yellow-500/10"
        onClick={onSuspendClick}
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
  );
}
