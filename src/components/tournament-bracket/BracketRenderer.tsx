import EsportsBracket from '@/components/brackets/EsportsBracket';
import CyberpunkBracket from '@/components/brackets/CyberpunkBracket';
import MinimalBracket from '@/components/brackets/MinimalBracket';
import ChampionshipBracket from '@/components/brackets/ChampionshipBracket';
import GoldDeagleBracket from '@/components/brackets/GoldDeagleBracket';

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

interface BracketRendererProps {
  bracketStyle: string;
  matches: Match[];
  canEdit: boolean;
  onMatchClick: (match: Match) => void;
  onEditMatch: (match: Match) => void;
}

export default function BracketRenderer({ 
  bracketStyle, 
  matches, 
  canEdit, 
  onMatchClick, 
  onEditMatch 
}: BracketRendererProps) {
  return (
    <>
      {bracketStyle === 'esports' && (
        <EsportsBracket
          matches={matches}
          canEdit={canEdit}
          onMatchClick={onMatchClick}
          onEditMatch={onEditMatch}
        />
      )}
      {bracketStyle === 'cyberpunk' && (
        <CyberpunkBracket
          matches={matches}
          canEdit={canEdit}
          onMatchClick={onMatchClick}
          onEditMatch={onEditMatch}
        />
      )}
      {bracketStyle === 'minimal' && (
        <MinimalBracket
          matches={matches}
          canEdit={canEdit}
          onMatchClick={onMatchClick}
          onEditMatch={onEditMatch}
        />
      )}
      {bracketStyle === 'championship' && (
        <ChampionshipBracket
          matches={matches}
          canEdit={canEdit}
          onMatchClick={onMatchClick}
          onEditMatch={onEditMatch}
        />
      )}
      {bracketStyle === 'gold-deagle' && (
        <GoldDeagleBracket
          matches={matches}
          canEdit={canEdit}
          onMatchClick={onMatchClick}
          onEditMatch={onEditMatch}
        />
      )}
    </>
  );
}
