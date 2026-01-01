import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface RoleAssignmentFormProps {
  selectedUserId: string;
  setSelectedUserId: (value: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  allUsers: any[];
  loading: boolean;
  handleAssignRole: () => void;
}

export function RoleAssignmentForm({
  selectedUserId,
  setSelectedUserId,
  selectedRole,
  setSelectedRole,
  allUsers,
  loading,
  handleAssignRole,
}: RoleAssignmentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="UserPlus" size={24} />
          Управление ролями
        </CardTitle>
        <CardDescription>
          Назначайте роли администраторов, организаторов и судей
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Пользователь</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите пользователя" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.nickname} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Роль</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Администратор</SelectItem>
                <SelectItem value="organizer">Организатор</SelectItem>
                <SelectItem value="referee">Судья</SelectItem>
                <SelectItem value="manager">Руководитель</SelectItem>
                <SelectItem value="user">Пользователь</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleAssignRole} disabled={loading}>
          <Icon name="UserPlus" size={18} className="mr-2" />
          Назначить роль
        </Button>
      </CardContent>
    </Card>
  );
}
