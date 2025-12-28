import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const TEAMS_API = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';

export default function ProfileInvitationsCard({ userId }: { userId: number }) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadInvitations();
  }, [userId]);

  const loadInvitations = async () => {
    try {
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({ action: 'get_invitations' }),
      });

      const data = await response.json();
      if (data.invitations) {
        setInvitations(data.invitations.filter((inv: any) => inv.status === 'pending'));
      }
    } catch (error) {
      console.error('Ошибка загрузки приглашений:', error);
    }
  };

  const handleRespond = async (invitationId: number, accept: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId.toString(),
        },
        body: JSON.stringify({
          action: 'respond_invitation',
          invitation_id: invitationId,
          accept,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        loadInvitations();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось ответить на приглашение',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Mail" size={24} />
          Приглашения в команды ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {invitations.map((inv) => (
          <div key={inv.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              {inv.logo_url && (
                <img src={inv.logo_url} alt={inv.team_name} className="w-12 h-12 rounded" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold">{inv.team_name}</h4>
                {inv.tag && <p className="text-sm text-muted-foreground">[{inv.tag}]</p>}
                <p className="text-xs text-muted-foreground">
                  От: {inv.inviter_name} • Роль: {inv.player_role === 'main' ? 'Основной' : 'Запасной'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleRespond(inv.id, true)}
                disabled={loading}
                className="flex-1"
              >
                <Icon name="Check" size={16} className="mr-1" />
                Принять
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRespond(inv.id, false)}
                disabled={loading}
                className="flex-1"
              >
                <Icon name="X" size={16} className="mr-1" />
                Отклонить
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
