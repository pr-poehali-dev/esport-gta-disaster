import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { showNotification } from '@/components/NotificationSystem';

interface BanPickItem {
  id: number;
  map_name: string;
  action: string;
  pick_order: number;
  created_at: string;
  team: {
    id: number;
    name: string;
    color: string;
  };
}

interface BanPickProps {
  matchId: string;
  teamId: number | null;
  isCaptain: boolean;
}

export default function BanPick({ matchId, teamId, isCaptain }: BanPickProps) {
  const [banspicks, setBansPicks] = useState<BanPickItem[]>([]);
  const [mapPool, setMapPool] = useState<string[]>([]);
  const [bestOf, setBestOf] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBanPick();
  }, [matchId]);

  const loadBanPick = async () => {
    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : '';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'get_ban_pick',
          match_id: matchId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setBansPicks(data.bans_picks || []);
        setMapPool(data.map_pool || []);
        setBestOf(data.best_of || 1);
      }
    } catch (error: any) {
      console.error('Error loading ban-pick:', error);
    }
  };

  const handleBanPick = async (mapName: string, action: 'ban' | 'pick') => {
    if (!isCaptain || !teamId) {
      showNotification('error', 'Ошибка', 'Только капитан может делать бан/пик');
      return;
    }

    setLoading(true);

    try {
      const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : '';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': userId.toString()
        },
        body: JSON.stringify({
          action: 'make_ban_pick',
          match_id: matchId,
          team_id: teamId,
          map_name: mapName,
          action: action
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', 'Успех', action === 'ban' ? 'Карта забанена' : 'Карта выбрана');
        loadBanPick();
      } else {
        showNotification('error', 'Ошибка', data.error);
      }
    } catch (error: any) {
      showNotification('error', 'Ошибка', error.message);
    } finally {
      setLoading(false);
    }
  };

  const isMapBanned = (mapName: string) => {
    return banspicks.some(bp => bp.map_name === mapName && bp.action === 'ban');
  };

  const isMapPicked = (mapName: string) => {
    return banspicks.some(bp => bp.map_name === mapName && bp.action === 'pick');
  };

  const getMapStatus = (mapName: string) => {
    const item = banspicks.find(bp => bp.map_name === mapName);
    if (!item) return null;

    return (
      <div className="text-xs" style={{ color: item.team.color }}>
        {item.action === 'ban' ? 'ЗАБАНЕНА' : 'ВЫБРАНА'} • {item.team.name}
      </div>
    );
  };

  const remainingPicks = mapPool.length - banspicks.length;
  const banPickComplete = remainingPicks <= bestOf;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icon name="Map" className="h-5 w-5" />
          Бан-пик карт
        </h3>
        <div className="text-sm text-muted-foreground">
          Best of {bestOf}
        </div>
      </div>

      {banPickComplete && (
        <div className="mb-4 p-3 rounded bg-green-500/10 text-green-500 text-sm">
          <Icon name="CheckCircle" className="h-4 w-4 inline mr-2" />
          Бан-пик завершен! Матч начался.
        </div>
      )}

      <div className="space-y-2 mb-4">
        {mapPool.map((map) => {
          const banned = isMapBanned(map);
          const picked = isMapPicked(map);
          const disabled = banned || picked || loading || !isCaptain;

          return (
            <div
              key={map}
              className={`p-3 rounded border ${
                banned ? 'bg-red-500/10 border-red-500/30' :
                picked ? 'bg-green-500/10 border-green-500/30' :
                'bg-background border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-bold">{map}</div>
                  {getMapStatus(map)}
                </div>

                {!banned && !picked && isCaptain && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleBanPick(map, 'ban')}
                      disabled={disabled}
                    >
                      <Icon name="X" className="h-4 w-4 mr-1" />
                      Бан
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBanPick(map, 'pick')}
                      disabled={disabled}
                    >
                      <Icon name="Check" className="h-4 w-4 mr-1" />
                      Пик
                    </Button>
                  </div>
                )}

                {(banned || picked) && (
                  <Icon 
                    name={banned ? "X" : "Check"} 
                    className={`h-6 w-6 ${banned ? 'text-red-500' : 'text-green-500'}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {banspicks.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {banspicks.length} / {mapPool.length} карт обработано
        </div>
      )}
    </Card>
  );
}