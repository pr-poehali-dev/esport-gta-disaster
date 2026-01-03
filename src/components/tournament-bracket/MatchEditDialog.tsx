import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Match {
  id: number;
  round: number;
  match_number: number;
  team1: { id: number; name: string; logo_url?: string } | null;
  team2: { id: number; name: string; logo_url?: string } | null;
  winner_id: number | null;
  score_team1: number;
  score_team2: number;
  map_name: string | null;
  scheduled_at: string | null;
  status: string;
}

interface MatchEditDialogProps {
  match: Match | null;
  onClose: () => void;
  onUpdateMatch: (matchId: number, score1: number, score2: number) => void;
  onCompleteMatch: (matchId: number) => void;
}

export default function MatchEditDialog({ 
  match, 
  onClose, 
  onUpdateMatch, 
  onCompleteMatch 
}: MatchEditDialogProps) {
  const [editedMatch, setEditedMatch] = useState(match);

  if (!match || !editedMatch) return null;

  return (
    <Dialog open={!!match} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать матч</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-2 block">Счет {editedMatch.team1?.name}</label>
              <Input
                type="number"
                defaultValue={editedMatch.score_team1}
                onChange={(e) => setEditedMatch({ ...editedMatch, score_team1: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Счет {editedMatch.team2?.name}</label>
              <Input
                type="number"
                defaultValue={editedMatch.score_team2}
                onChange={(e) => setEditedMatch({ ...editedMatch, score_team2: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              onClick={() => {
                onUpdateMatch(editedMatch.id, editedMatch.score_team1, editedMatch.score_team2);
              }}
            >
              Сохранить счет
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                onCompleteMatch(editedMatch.id);
              }}
            >
              Завершить матч
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
