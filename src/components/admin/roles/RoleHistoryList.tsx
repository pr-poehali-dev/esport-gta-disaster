import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RoleHistoryListProps {
  history: any[];
  getRoleBadge: (role: string) => JSX.Element;
}

export function RoleHistoryList({ history, getRoleBadge }: RoleHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="History" size={24} />
          Последние действия
        </CardTitle>
        <CardDescription>История изменения ролей и административных действий</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileText" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Нет записей</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 border-l-2 border-primary/30 hover:border-primary bg-card hover:bg-muted/20 transition-all"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="UserCog" size={16} className="text-primary" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.admin_name}</span>
                    {item.admin_role && (
                      <span className="text-xs">{getRoleBadge(item.admin_role)}</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.old_role && item.new_role ? (
                      <>
                        изменил роль <span className="font-medium text-foreground">{item.target_name}</span> с{' '}
                        <span className="inline-block mx-1">{getRoleBadge(item.old_role)}</span> на{' '}
                        <span className="inline-block mx-1">{getRoleBadge(item.new_role)}</span>
                      </>
                    ) : (
                      <span>{item.action || 'Выполнил действие'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon name="Clock" size={12} />
                    {new Date(item.created_at).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
