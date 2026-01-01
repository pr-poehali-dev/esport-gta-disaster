import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RoleStatsCardsProps {
  roleStats: {
    founder: number;
    admin: number;
    organizer: number;
    referee: number;
    manager: number;
  };
}

export function RoleStatsCards({ roleStats }: RoleStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="p-4 hover:shadow-lg transition-all border-purple-600/30 bg-purple-600/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <Icon name="Crown" size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{roleStats.founder}</p>
            <p className="text-xs text-muted-foreground">Основатель</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover:shadow-lg transition-all border-red-600/30 bg-red-600/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
            <Icon name="Shield" size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{roleStats.admin}</p>
            <p className="text-xs text-muted-foreground">Администраторы</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover:shadow-lg transition-all border-blue-600/30 bg-blue-600/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Icon name="Briefcase" size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{roleStats.organizer}</p>
            <p className="text-xs text-muted-foreground">Организаторы</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover:shadow-lg transition-all border-cyan-600/30 bg-cyan-600/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center">
            <Icon name="Gavel" size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{roleStats.referee}</p>
            <p className="text-xs text-muted-foreground">Судьи</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 hover:shadow-lg transition-all border-green-600/30 bg-green-600/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
            <Icon name="UserCog" size={20} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{roleStats.manager}</p>
            <p className="text-xs text-muted-foreground">Руководители</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
