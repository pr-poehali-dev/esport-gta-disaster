import Icon from '@/components/ui/icon';

interface EmptyBracketPlaceholderProps {
  bracketStyle: string;
}

export default function EmptyBracketPlaceholder({ bracketStyle }: EmptyBracketPlaceholderProps) {
  return (
    <div className="text-center py-20">
      <div className={`inline-block p-8 rounded-xl border ${
        bracketStyle === 'minimal' 
          ? 'bg-white border-slate-200 shadow-xl' 
          : bracketStyle === 'cyberpunk'
          ? 'bg-black border-amber-500/30'
          : 'bg-[#1a1f2e] border-white/10'
      }`}>
        <Icon name="GitBranch" className={`h-16 w-16 mx-auto mb-4 ${
          bracketStyle === 'minimal' ? 'text-purple-500' : bracketStyle === 'cyberpunk' ? 'text-amber-500' : 'text-purple-400'
        }`} />
        <h3 className={`text-xl font-bold mb-2 ${
          bracketStyle === 'minimal' ? 'text-slate-900' : 'text-white'
        }`}>Турнирная сетка не сгенерирована</h3>
        <p className={bracketStyle === 'minimal' ? 'text-slate-600' : 'text-gray-400'}>
          Администратор должен сгенерировать сетку в админ-панели
        </p>
      </div>
    </div>
  );
}
