import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BracketHeaderProps {
  tournamentId: string | undefined;
  bracketStyle: string;
  onFullscreen: () => void;
}

export default function BracketHeader({ tournamentId, bracketStyle, onFullscreen }: BracketHeaderProps) {
  const navigate = useNavigate();

  const getButtonClasses = () => {
    if (bracketStyle === 'minimal') {
      return {
        outline: 'border-slate-300 text-slate-900 hover:bg-slate-100',
        primary: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white'
      };
    } else if (bracketStyle === 'cyberpunk') {
      return {
        outline: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
        primary: 'bg-amber-500 hover:bg-amber-600 text-black font-bold'
      };
    } else if (bracketStyle === 'championship') {
      return {
        outline: 'border-white/10 text-white hover:bg-white/5',
        primary: 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white'
      };
    } else if (bracketStyle === 'gold-deagle') {
      return {
        outline: 'border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10',
        primary: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] text-black font-bold'
      };
    }
    return {
      outline: 'border-white/10 text-white hover:bg-white/5',
      primary: 'bg-purple-600 hover:bg-purple-700'
    };
  };

  const buttonStyles = getButtonClasses();

  return (
    <div className="mb-6 flex justify-between items-center">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/tournaments/${tournamentId}`)} 
        className={buttonStyles.outline}
      >
        <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
        Назад к турниру
      </Button>
      <Button onClick={onFullscreen} className={buttonStyles.primary}>
        <Icon name="Maximize" className="h-4 w-4 mr-2" />
        На весь экран
      </Button>
    </div>
  );
}
