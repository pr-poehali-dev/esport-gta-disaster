import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export function AdminContentSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Управление Контентом</h1>
        <Button>
          <Icon name="Plus" size={20} className="mr-2" />
          Добавить контент
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <Icon name="Image" size={32} className="text-primary" />
          <h3 className="text-2xl font-bold">156</h3>
          <p className="text-muted-foreground">Изображений</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="Video" size={32} className="text-secondary" />
          <h3 className="text-2xl font-bold">24</h3>
          <p className="text-muted-foreground">Видео</p>
        </Card>
        
        <Card className="p-6 space-y-2">
          <Icon name="FileText" size={32} className="text-accent" />
          <h3 className="text-2xl font-bold">89</h3>
          <p className="text-muted-foreground">Документов</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Последние загрузки</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Icon name="Image" size={24} className="text-primary" />
            <div className="flex-1">
              <p className="font-semibold">tournament_banner.jpg</p>
              <p className="text-sm text-muted-foreground">2.4 MB • Загружено 2 часа назад</p>
            </div>
            <Button size="sm" variant="outline">
              <Icon name="Eye" size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Icon name="Video" size={24} className="text-secondary" />
            <div className="flex-1">
              <p className="font-semibold">gameplay_highlights.mp4</p>
              <p className="text-sm text-muted-foreground">45.2 MB • Загружено вчера</p>
            </div>
            <Button size="sm" variant="outline">
              <Icon name="Eye" size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
