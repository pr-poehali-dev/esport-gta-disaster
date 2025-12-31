import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import TournamentMapPool from './TournamentMapPool';

interface FormData {
  name: string;
  description: string;
  prize_pool: string;
  location: string;
  game_project: string;
  map_pool: string[];
  format: string;
  team_size: number;
  best_of: number;
  start_date: string;
}

interface CreateTournamentFormProps {
  formData: FormData;
  mapInput: string;
  onFormDataChange: (data: Partial<FormData>) => void;
  onMapInputChange: (value: string) => void;
  onAddMap: () => void;
  onRemoveMap: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function CreateTournamentForm({
  formData,
  mapInput,
  onFormDataChange,
  onMapInputChange,
  onAddMap,
  onRemoveMap,
  onSubmit,
  onCancel
}: CreateTournamentFormProps) {
  return (
    <Card className="bg-[#1a1f2e]/50 border-white/10 p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-6">Создать новый турнир</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white mb-2 block">Название турнира *</Label>
            <Input
              value={formData.name}
              onChange={(e) => onFormDataChange({ name: e.target.value })}
              placeholder="Например: GTA Disaster Cup 2024"
              className="bg-[#1a1f2e] border-white/10 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Дата начала</Label>
            <Input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => onFormDataChange({ start_date: e.target.value })}
              className="bg-[#1a1f2e] border-white/10 text-white"
            />
          </div>
        </div>

        <div>
          <Label className="text-white mb-2 block">Описание</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Описание турнира"
            className="bg-[#1a1f2e] border-white/10 text-white min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white mb-2 block">Призовой фонд</Label>
            <Input
              value={formData.prize_pool}
              onChange={(e) => onFormDataChange({ prize_pool: e.target.value })}
              placeholder="Например: 100 000 ₽"
              className="bg-[#1a1f2e] border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Локация</Label>
            <Input
              value={formData.location}
              onChange={(e) => onFormDataChange({ location: e.target.value })}
              placeholder="Например: Онлайн"
              className="bg-[#1a1f2e] border-white/10 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-white mb-2 block">Формат</Label>
            <Input
              value={formData.format}
              onChange={(e) => onFormDataChange({ format: e.target.value })}
              placeholder="5v5"
              className="bg-[#1a1f2e] border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Размер команды</Label>
            <Input
              type="number"
              value={formData.team_size}
              onChange={(e) => onFormDataChange({ team_size: parseInt(e.target.value) || 0 })}
              className="bg-[#1a1f2e] border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Best of</Label>
            <Input
              type="number"
              value={formData.best_of}
              onChange={(e) => onFormDataChange({ best_of: parseInt(e.target.value) || 0 })}
              className="bg-[#1a1f2e] border-white/10 text-white"
            />
          </div>
        </div>

        <TournamentMapPool
          maps={formData.map_pool}
          mapInput={mapInput}
          onMapInputChange={onMapInputChange}
          onAddMap={onAddMap}
          onRemoveMap={onRemoveMap}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Создать турнир
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            Отмена
          </Button>
        </div>
      </form>
    </Card>
  );
}