import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TEAMS_API = 'https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515';

interface TeamMember {
  id: number;
  user_id: number;
  nickname: string;
  avatar_url: string | null;
  member_role: string;
  is_captain: boolean;
  joined_at: string;
}

interface ManageTeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: any;
  members: TeamMember[];
  onSuccess: () => void;
}

export default function ManageTeamMembersDialog({ 
  open, 
  onOpenChange, 
  team, 
  members,
  onSuccess 
}: ManageTeamMembersDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('main');
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [transferringTo, setTransferringTo] = useState<number | null>(null);

  const handleTransferCaptaincy = async (newCaptainId: number) => {
    if (!confirm('Вы уверены, что хотите передать капитанство? Это действие нельзя отменить.')) {
      return;
    }

    setTransferringTo(newCaptainId);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          action: 'transfer_captaincy',
          team_id: team.id,
          new_captain_id: newCaptainId
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: '✅ Капитанство передано',
          description: data.message,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось передать капитанство',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка передачи капитанства',
        variant: 'destructive',
      });
    } finally {
      setTransferringTo(null);
    }
  };

  const handleSearchUsers = async () => {
    if (searchQuery.trim().length < 2) {
      toast({
        title: 'Ошибка',
        description: 'Введите минимум 2 символа для поиска',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search_users',
          query: searchQuery.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.users) {
        const existingMemberIds = members.map(m => m.user_id);
        const filteredUsers = data.users.filter((u: any) => !existingMemberIds.includes(u.id));
        setSearchResults(filteredUsers);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось найти пользователей',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка поиска пользователей',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInvitePlayer = async (userId: number) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          action: 'invite_player',
          team_id: team.id,
          invited_user_id: userId,
          player_role: selectedRole
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: '✅ Приглашение отправлено',
          description: 'Игрок получит уведомление о приглашении',
        });
        setSearchQuery('');
        setSearchResults([]);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить приглашение',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка отправки приглашения',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Вы уверены, что хотите исключить этого участника?')) {
      return;
    }

    setRemovingMemberId(memberId);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(TEAMS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id?.toString() || ''
        },
        body: JSON.stringify({
          action: 'remove_member',
          team_id: team.id,
          member_user_id: memberId
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast({
          title: '✅ Участник исключён',
          description: data.message,
        });
        onSuccess();
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось исключить участника',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка исключения участника',
        variant: 'destructive',
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'main') return { label: 'Основной', variant: 'default' as const };
    if (role === 'substitute') return { label: 'Запасной', variant: 'secondary' as const };
    return { label: role, variant: 'outline' as const };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto border-primary/30 bg-card/95 backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Icon name="Users" size={24} className="text-primary" />
            Управление составом
          </DialogTitle>
          <DialogDescription>
            Приглашайте новых участников и управляйте составом команды "{team?.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Информация о передаче капитанства */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Передача капитанства:</strong> Нажмите на иконку короны рядом с участником, чтобы передать ему права капитана. После передачи вы станете обычным участником команды.
              </p>
            </div>
          </div>

          {/* Текущий состав */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="Shield" size={18} className="text-primary" />
              Текущий состав ({members.length})
            </h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  В команде пока нет участников
                </div>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.nickname} 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      ) : (
                        <Icon name="User" className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">{member.nickname}</p>
                        {member.is_captain && (
                          <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500">
                            <Icon name="Crown" size={12} className="mr-1" />
                            Капитан
                          </Badge>
                        )}
                      </div>
                      <Badge variant={getRoleBadge(member.member_role).variant} className="text-xs mt-1">
                        {getRoleBadge(member.member_role).label}
                      </Badge>
                    </div>

                    {!member.is_captain && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTransferCaptaincy(member.user_id)}
                          disabled={transferringTo === member.user_id || loading}
                          title="Передать капитанство"
                        >
                          {transferringTo === member.user_id ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <Icon name="Crown" size={16} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveMember(member.user_id)}
                          disabled={removingMemberId === member.user_id || loading}
                          title="Исключить из команды"
                        >
                          {removingMemberId === member.user_id ? (
                            <Icon name="Loader2" size={16} className="animate-spin" />
                          ) : (
                            <Icon name="X" size={16} />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="UserPlus" size={18} className="text-primary" />
              Пригласить нового участника
            </h3>

            <div className="space-y-3">
              <div>
                <Label>Роль игрока</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">
                      <span className="flex items-center gap-2">
                        <Icon name="Star" size={14} />
                        Основной состав
                      </span>
                    </SelectItem>
                    <SelectItem value="substitute">
                      <span className="flex items-center gap-2">
                        <Icon name="Users" size={14} />
                        Запасной
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Поиск игрока по никнейму</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Введите никнейм..."
                    className="border-primary/30"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={handleSearchUsers}
                  disabled={loading || searchQuery.trim().length < 2}
                  className="mt-6"
                >
                  {loading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Search" size={16} />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.nickname} 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        ) : (
                          <Icon name="User" className="h-5 w-5 text-primary" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold">{user.nickname}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleInvitePlayer(user.id)}
                        disabled={loading}
                      >
                        <Icon name="UserPlus" size={16} className="mr-2" />
                        Пригласить
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-primary/30"
            >
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}