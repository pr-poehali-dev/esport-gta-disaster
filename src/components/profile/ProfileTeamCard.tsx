import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { playClickSound, playHoverSound } from '@/utils/sounds';
import TeamManagement from '@/components/TeamManagement';

interface ProfileTeamCardProps {
  team: any;
  loadingTeam: boolean;
  showTeamManagement: boolean;
  onCreateTeam: () => void;
  onEditTeam: () => void;
  onDeleteTeam: () => void;
  onToggleTeamManagement: () => void;
  onTeamUpdate: () => void;
}

export default function ProfileTeamCard({
  team,
  loadingTeam,
  showTeamManagement,
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
  onToggleTeamManagement,
  onTeamUpdate,
}: ProfileTeamCardProps) {
  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Users" className="text-primary" size={24} />
            Моя команда
          </div>
          {!team && !loadingTeam && (
            <Button 
              onClick={() => {
                playClickSound();
                onCreateTeam();
              }}
              onMouseEnter={playHoverSound}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Создать команду
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingTeam ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : team ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="text-5xl">{team.logo_url}</div>
              <div className="flex-1">
                <div className="text-2xl font-black">{team.name}</div>
                <div className="text-sm text-muted-foreground">
                  Капитан: {team.captain_nickname}
                </div>
                <div className="text-sm text-muted-foreground">
                  Игроков в составе: {team.roster?.length || 0}/7
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    playClickSound();
                    onEditTeam();
                  }}
                  onMouseEnter={playHoverSound}
                  variant="outline"
                  className="border-primary/30"
                >
                  <Icon name="Edit" size={18} className="mr-2" />
                  Редактировать
                </Button>
                <Button
                  onClick={() => {
                    playClickSound();
                    onToggleTeamManagement();
                  }}
                  onMouseEnter={playHoverSound}
                  variant="outline"
                  className="border-primary/30"
                >
                  <Icon name="Users" size={18} className="mr-2" />
                  {showTeamManagement ? 'Скрыть состав' : 'Состав'}
                </Button>
                <Button
                  onClick={() => {
                    playClickSound();
                    onDeleteTeam();
                  }}
                  onMouseEnter={playHoverSound}
                  variant="destructive"
                >
                  <Icon name="Trash2" size={18} className="mr-2" />
                  Удалить
                </Button>
              </div>
            </div>
            
            {showTeamManagement && (
              <div className="mt-4">
                <TeamManagement 
                  teamId={team.id} 
                  onUpdate={onTeamUpdate}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Users" size={48} className="mx-auto mb-4 opacity-30" />
            <p className="mb-4">У вас еще нет команды</p>
            <p className="text-sm">Создайте команду, чтобы участвовать в турнирах</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
