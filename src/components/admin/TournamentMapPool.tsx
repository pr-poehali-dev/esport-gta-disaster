import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface TournamentMapPoolProps {
  maps: string[];
  mapInput: string;
  onMapInputChange: (value: string) => void;
  onAddMap: () => void;
  onRemoveMap: (index: number) => void;
}

export default function TournamentMapPool({
  maps,
  mapInput,
  onMapInputChange,
  onAddMap,
  onRemoveMap
}: TournamentMapPoolProps) {
  return (
    <div>
      <Label className="text-white mb-2 block">Пул карт</Label>
      <div className="flex gap-2 mb-2">
        <Input
          value={mapInput}
          onChange={(e) => onMapInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddMap())}
          placeholder="Название карты"
          className="bg-[#1a1f2e] border-white/10 text-white"
        />
        <Button
          type="button"
          onClick={onAddMap}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Icon name="Plus" size={16} />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {maps.map((map, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-[#1a1f2e] px-3 py-1 rounded border border-white/10"
          >
            <span className="text-white text-sm">{map}</span>
            <button
              type="button"
              onClick={() => onRemoveMap(index)}
              className="text-red-400 hover:text-red-300"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
