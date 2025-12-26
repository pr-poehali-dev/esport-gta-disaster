import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { playClickSound, playHoverSound } from '@/utils/sounds';

interface Registration {
  id: number;
  team_id: number;
  team_name: string;
  logo_url: string;
  tournament_name: string;
  captain_nickname: string;
  discord_contact: string;
  comment: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_comment?: string;
  registered_at: string;
}

interface ModerationPanelProps {
  allRegistrations: Registration[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onUpdateStatus: (registrationId: number, status: 'approved' | 'rejected', comment?: string) => void;
}

const ModerationPanel = ({ allRegistrations, statusFilter, onStatusFilterChange, onUpdateStatus }: ModerationPanelProps) => {
  const filteredRegistrations = statusFilter === 'all' 
    ? allRegistrations 
    : allRegistrations.filter(r => r.moderation_status === statusFilter);

  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Shield" className="text-primary" size={24} />
            Модерация заявок
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[200px] bg-background/50 border-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все заявки</SelectItem>
              <SelectItem value="pending">На рассмотрении</SelectItem>
              <SelectItem value="approved">Одобренные</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-30" />
            <p>Нет заявок для отображения</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map(reg => (
              <ModerationCard
                key={reg.id}
                registration={reg}
                onUpdateStatus={onUpdateStatus}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ModerationCardProps {
  registration: Registration;
  onUpdateStatus: (id: number, status: 'approved' | 'rejected', comment?: string) => void;
}

const ModerationCard = ({ registration, onUpdateStatus }: ModerationCardProps) => {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleApprove = () => {
    playClickSound();
    onUpdateStatus(registration.id, 'approved');
  };

  const handleReject = () => {
    playClickSound();
    if (showComment) {
      onUpdateStatus(registration.id, 'rejected', comment);
      setShowComment(false);
      setComment('');
    } else {
      setShowComment(true);
    }
  };

  return (
    <div className="p-4 rounded-lg border border-primary/20 bg-background/50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">{registration.logo_url}</div>
            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-lg">{registration.team_name}</div>
                <Badge className={
                  registration.moderation_status === 'pending' 
                    ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' 
                    : registration.moderation_status === 'approved'
                    ? 'bg-green-500/20 text-green-500 border-green-500/30'
                    : 'bg-red-500/20 text-red-500 border-red-500/30'
                }>
                  {registration.moderation_status === 'pending' && '⏳ На рассмотрении'}
                  {registration.moderation_status === 'approved' && '✅ Одобрено'}
                  {registration.moderation_status === 'rejected' && '❌ Отклонено'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1 mt-1">
                <div>Турнир: {registration.tournament_name}</div>
                <div>Капитан: {registration.captain_nickname}</div>
                <div>Discord: {registration.discord_contact}</div>
                <div className="text-xs">
                  Подана: {new Date(registration.registered_at).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {registration.comment && (
        <div className="mb-3 p-3 rounded bg-muted/30 text-sm">
          <div className="text-xs text-muted-foreground mb-1">Комментарий команды:</div>
          {registration.comment}
        </div>
      )}

      {registration.moderation_comment && (
        <div className="mb-3 p-3 rounded bg-primary/10 text-sm border border-primary/20">
          <div className="text-xs text-primary mb-1">Комментарий модератора:</div>
          {registration.moderation_comment}
        </div>
      )}

      {registration.moderation_status === 'pending' && (
        <div className="space-y-3">
          {showComment && (
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Причина отклонения..."
              className="bg-background/50 border-primary/30"
            />
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              onMouseEnter={playHoverSound}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30"
              variant="outline"
            >
              <Icon name="Check" size={18} className="mr-2" />
              Одобрить
            </Button>
            <Button
              onClick={handleReject}
              onMouseEnter={playHoverSound}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30"
              variant="outline"
            >
              <Icon name="X" size={18} className="mr-2" />
              {showComment ? 'Подтвердить отклонение' : 'Отклонить'}
            </Button>
            {showComment && (
              <Button
                onClick={() => {
                  playClickSound();
                  setShowComment(false);
                  setComment('');
                }}
                onMouseEnter={playHoverSound}
                variant="outline"
                className="border-primary/30"
              >
                Отмена
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationPanel;