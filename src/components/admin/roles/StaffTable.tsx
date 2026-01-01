import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface StaffTableProps {
  staff: any[];
  loading: boolean;
  handleRevokeRole: (userId: number) => void;
  getRoleBadge: (role: string) => JSX.Element;
}

export function StaffTable({ staff, loading, handleRevokeRole, getRoleBadge }: StaffTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Текущие администраторы</span>
          <span className="text-sm font-normal text-muted-foreground">
            Всего: {staff.length}
          </span>
        </CardTitle>
        <CardDescription>
          Список всех пользователей с административными правами
        </CardDescription>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="UserX" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Нет администраторов</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Дата назначения</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id} className="hover:bg-muted/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {member.avatar_url && (
                          <img
                            src={member.avatar_url}
                            alt={member.nickname}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        {member.nickname}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.created_at
                        ? new Date(member.created_at).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.role !== 'founder' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRevokeRole(member.id)}
                          disabled={loading}
                        >
                          <Icon name="UserMinus" size={16} className="mr-1" />
                          Снять роль
                        </Button>
                      )}
                      {member.role === 'founder' && (
                        <span className="text-xs text-muted-foreground italic">
                          Нельзя изменить
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
