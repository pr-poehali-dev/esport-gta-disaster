import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface UserRegistrationsListProps {
  registrations: Registration[];
}

const UserRegistrationsList = ({ registrations }: UserRegistrationsListProps) => {
  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon name="List" className="text-primary" size={24} />
          Мои заявки
        </CardTitle>
      </CardHeader>
      <CardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>У вас пока нет поданных заявок</p>
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map(reg => (
              <div key={reg.id} className="p-4 rounded-lg border border-primary/20 bg-background/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{reg.logo_url}</div>
                    <div>
                      <div className="font-bold text-lg">{reg.tournament_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Команда: {reg.team_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Discord: {reg.discord_contact}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Подана: {new Date(reg.registered_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    reg.moderation_status === 'pending' 
                      ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' 
                      : reg.moderation_status === 'approved'
                      ? 'bg-green-500/20 text-green-500 border-green-500/30'
                      : 'bg-red-500/20 text-red-500 border-red-500/30'
                  }>
                    {reg.moderation_status === 'pending' && '⏳ На рассмотрении'}
                    {reg.moderation_status === 'approved' && '✅ Одобрено'}
                    {reg.moderation_status === 'rejected' && '❌ Отклонено'}
                  </Badge>
                </div>
                
                {reg.comment && (
                  <div className="mb-2 p-3 rounded bg-muted/30 text-sm">
                    <div className="text-xs text-muted-foreground mb-1">Комментарий:</div>
                    {reg.comment}
                  </div>
                )}

                {reg.moderation_comment && (
                  <div className="p-3 rounded bg-primary/10 text-sm border border-primary/20">
                    <div className="text-xs text-primary mb-1">Комментарий модератора:</div>
                    {reg.moderation_comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRegistrationsList;