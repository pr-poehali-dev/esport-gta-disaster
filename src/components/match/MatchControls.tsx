import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface MatchControlsProps {
  matchId: string | undefined;
  team1Id: number;
  team2Id: number;
  initialTeam1Score: number;
  initialTeam2Score: number;
  team1CaptainConfirmed: boolean;
  team2CaptainConfirmed: boolean;
  isCaptain1: boolean;
  isCaptain2: boolean;
  isReferee: boolean;
  isModerator: boolean;
  canUpload: boolean;
  remainingTime: string;
  uploadingScreenshot: boolean;
  onUploadScreenshot: (teamId: number) => void;
  onUpdateScore: (team1Score: number, team2Score: number) => void;
  onConfirmResult: () => void;
  onNullifyMatch: () => void;
}

export default function MatchControls({
  matchId,
  team1Id,
  team2Id,
  initialTeam1Score,
  initialTeam2Score,
  team1CaptainConfirmed,
  team2CaptainConfirmed,
  isCaptain1,
  isCaptain2,
  isReferee,
  isModerator,
  canUpload,
  remainingTime,
  uploadingScreenshot,
  onUploadScreenshot,
  onUpdateScore,
  onConfirmResult,
  onNullifyMatch
}: MatchControlsProps) {
  const [team1Score, setTeam1Score] = useState(initialTeam1Score);
  const [team2Score, setTeam2Score] = useState(initialTeam2Score);

  const handleUpdateScore = () => {
    onUpdateScore(team1Score, team2Score);
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Управление матчем</h3>

      {(isCaptain1 || isCaptain2 || isModerator) && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Счет команды 1</label>
              <Input
                type="number"
                value={team1Score}
                onChange={(e) => setTeam1Score(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Счет команды 2</label>
              <Input
                type="number"
                value={team2Score}
                onChange={(e) => setTeam2Score(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <Button onClick={handleUpdateScore}>
              <Icon name="Save" className="h-4 w-4 mr-2" />
              Обновить счет
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isCaptain1 && (
              <Button
                onClick={() => onUploadScreenshot(team1Id)}
                disabled={uploadingScreenshot || !canUpload}
                variant="outline"
              >
                <Icon name={uploadingScreenshot ? 'Loader2' : 'Upload'} className={`h-4 w-4 mr-2 ${uploadingScreenshot ? 'animate-spin' : ''}`} />
                {!canUpload ? `Загрузка через ${remainingTime}` : 'Загрузить скриншот (Команда 1)'}
              </Button>
            )}
            {isCaptain2 && (
              <Button
                onClick={() => onUploadScreenshot(team2Id)}
                disabled={uploadingScreenshot || !canUpload}
                variant="outline"
              >
                <Icon name={uploadingScreenshot ? 'Loader2' : 'Upload'} className={`h-4 w-4 mr-2 ${uploadingScreenshot ? 'animate-spin' : ''}`} />
                {!canUpload ? `Загрузка через ${remainingTime}` : 'Загрузить скриншот (Команда 2)'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isCaptain1 && !team1CaptainConfirmed && (
              <Button onClick={onConfirmResult}>
                <Icon name="Check" className="h-4 w-4 mr-2" />
                Подтвердить результат (Капитан 1)
              </Button>
            )}
            {isCaptain2 && !team2CaptainConfirmed && (
              <Button onClick={onConfirmResult}>
                <Icon name="Check" className="h-4 w-4 mr-2" />
                Подтвердить результат (Капитан 2)
              </Button>
            )}
          </div>

          {(isReferee || isModerator) && (
            <Button onClick={onNullifyMatch} variant="destructive">
              <Icon name="XCircle" className="h-4 w-4 mr-2" />
              Аннулировать матч
            </Button>
          )}

          <div className="flex gap-2 text-sm">
            {team1CaptainConfirmed && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 font-bold">
                <Icon name="Check" className="h-4 w-4 inline mr-1" />
                Капитан 1 подтвердил
              </span>
            )}
            {team2CaptainConfirmed && (
              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 font-bold">
                <Icon name="Check" className="h-4 w-4 inline mr-1" />
                Капитан 2 подтвердил
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
