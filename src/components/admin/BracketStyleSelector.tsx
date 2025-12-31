import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BracketStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface BracketStyleSelectorProps {
  onSelect: (styleId: string) => void;
  onCancel: () => void;
}

const bracketStyles: BracketStyle[] = [
  {
    id: 'esports',
    name: 'Киберспорт',
    description: 'Яркие неоновые цвета, энергичный дизайн',
    preview: '⚡',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#06b6d4'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Киберпанк',
    description: 'Футуристичный стиль с глитч-эффектами',
    preview: '🌃',
    colors: {
      primary: '#f59e0b',
      secondary: '#10b981',
      accent: '#3b82f6'
    }
  },
  {
    id: 'minimal',
    name: 'Минимализм',
    description: 'Чистый и современный дизайн',
    preview: '◾',
    colors: {
      primary: '#6366f1',
      secondary: '#64748b',
      accent: '#94a3b8'
    }
  },
  {
    id: 'championship',
    name: 'Championship',
    description: 'Групповая стадия + плей-офф, премиум стиль',
    preview: '🏆',
    colors: {
      primary: '#8b5cf6',
      secondary: '#1a1f2e',
      accent: '#ec4899'
    }
  }
];

export default function BracketStyleSelector({ onSelect, onCancel }: BracketStyleSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-[#1a1f2e] border-white/10 p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Выберите стиль турнирной сетки</h2>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="border-white/10 text-white hover:bg-white/5"
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {bracketStyles.map((style) => (
            <Card
              key={style.id}
              className="bg-[#0a0e1a] border-white/10 p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
              onClick={() => onSelect(style.id)}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {style.preview}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{style.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{style.description}</p>
              </div>

              <div className="flex gap-2 justify-center mb-4">
                <div
                  className="w-12 h-12 rounded"
                  style={{ backgroundColor: style.colors.primary }}
                />
                <div
                  className="w-12 h-12 rounded"
                  style={{ backgroundColor: style.colors.secondary }}
                />
                <div
                  className="w-12 h-12 rounded"
                  style={{ backgroundColor: style.colors.accent }}
                />
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 group-hover:bg-purple-500"
              >
                Выбрать стиль
              </Button>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            Отмена
          </Button>
        </div>
      </Card>
    </div>
  );
}