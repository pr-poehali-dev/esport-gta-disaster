import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Screenshot {
  id: number;
  team_id: number;
  screenshot_url: string;
  description: string | null;
  uploaded_at: string;
  uploaded_by_name: string;
  team_name: string;
}

interface MatchScreenshotsProps {
  screenshots: Screenshot[];
}

export default function MatchScreenshots({ screenshots }: MatchScreenshotsProps) {
  if (screenshots.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Скриншоты матча</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="Image" className="h-12 w-12 mx-auto mb-2" />
          <p>Скриншоты еще не загружены</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">Скриншоты матча ({screenshots.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((screenshot) => (
          <div key={screenshot.id} className="space-y-2">
            <a
              href={screenshot.screenshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={screenshot.screenshot_url}
                alt="Screenshot"
                className="w-full h-48 object-cover rounded-lg hover:opacity-80 transition-opacity"
              />
            </a>
            <div className="text-sm">
              <div className="font-bold">{screenshot.team_name}</div>
              <div className="text-muted-foreground">
                {screenshot.uploaded_by_name} •{' '}
                {new Date(screenshot.uploaded_at).toLocaleDateString('ru-RU')}
              </div>
              {screenshot.description && (
                <div className="text-muted-foreground mt-1">{screenshot.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
