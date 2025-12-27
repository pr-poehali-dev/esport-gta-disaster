import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Block {
  id: string;
  type: 'text' | 'image' | 'button' | 'heading' | 'video' | 'columns';
  content: string;
  styles?: Record<string, string>;
}

export default function PageEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageTitle, setPageTitle] = useState('Новая страница');
  const [pageSlug, setPageSlug] = useState('new-page');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDraft, setIsDraft] = useState(true);

  useEffect(() => {
    const savedDraft = localStorage.getItem('page-draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setPageTitle(draft.pageTitle);
        setPageSlug(draft.pageSlug);
        setBlocks(draft.blocks);
        setLastSaved(new Date(draft.timestamp));
        toast({ title: 'Черновик восстановлен', description: 'Продолжите редактирование' });
      } catch (e) {
        console.error('Failed to restore draft');
      }
    }
  }, []);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (blocks.length > 0) {
        const draft = {
          pageTitle,
          pageSlug,
          blocks,
          timestamp: Date.now()
        };
        localStorage.setItem('page-draft', JSON.stringify(draft));
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [pageTitle, pageSlug, blocks]);

  const blockTypes = [
    { type: 'heading', icon: 'Heading', label: 'Заголовок' },
    { type: 'text', icon: 'Type', label: 'Текст' },
    { type: 'image', icon: 'Image', label: 'Изображение' },
    { type: 'button', icon: 'MousePointerClick', label: 'Кнопка' },
    { type: 'video', icon: 'Video', label: 'Видео' },
    { type: 'columns', icon: 'Columns', label: 'Колонки' }
  ];

  const addBlock = (type: string) => {
    const defaultContent: Record<string, string> = {
      heading: 'Новый заголовок',
      text: 'Введите текст здесь...',
      image: 'https://via.placeholder.com/800x400',
      button: 'Нажми меня',
      video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      columns: 'Колонка 1 | Колонка 2'
    };

    const newBlock: Block = {
      id: Date.now().toString(),
      type: type as Block['type'],
      content: defaultContent[type] || '',
      styles: {}
    };

    setBlocks([...blocks, newBlock]);
    toast({
      title: 'Блок добавлен',
      description: `Добавлен блок типа "${type}"`
    });
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlock(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const renderBlock = (block: Block) => {
    switch (block.type) {
      case 'heading':
        return <h2 className="text-3xl font-bold">{block.content}</h2>;
      case 'text':
        return <p className="text-base">{block.content}</p>;
      case 'image':
        return <img src={block.content} alt="Block" className="w-full rounded" />;
      case 'button':
        return <Button>{block.content}</Button>;
      case 'video':
        return <iframe src={block.content} className="w-full h-64 rounded" />;
      case 'columns':
        return (
          <div className="grid grid-cols-2 gap-4">
            {block.content.split('|').map((col, i) => (
              <div key={i} className="p-4 border rounded">{col.trim()}</div>
            ))}
          </div>
        );
      default:
        return <div>{block.content}</div>;
    }
  };

  const savePage = () => {
    localStorage.removeItem('page-draft');
    setIsDraft(false);
    const version = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      pageTitle,
      pageSlug,
      blocks: [...blocks]
    };
    const savedVersions = JSON.parse(localStorage.getItem('page-versions') || '[]');
    savedVersions.push(version);
    localStorage.setItem('page-versions', JSON.stringify(savedVersions.slice(-10)));
    
    toast({
      title: 'Страница сохранена',
      description: `Страница "${pageTitle}" успешно сохранена`
    });
    navigate('/cms?tab=pages');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/cms')}>
              <Icon name="ArrowLeft" className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{pageTitle}</h1>
                {isDraft && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Черновик</span>}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>/{pageSlug}</span>
                {lastSaved && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" className="h-3 w-3" />
                      Сохранено {lastSaved.toLocaleTimeString('ru-RU')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Icon name="Eye" className="mr-2 h-4 w-4" />
              Предпросмотр
            </Button>
            <Button onClick={savePage}>
              <Icon name="Save" className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 container mx-auto px-4 py-6">
        {/* Панель инструментов */}
        <div className="col-span-3">
          <Card className="p-4 sticky top-24">
            <h3 className="font-bold mb-4">Добавить блок</h3>
            <div className="space-y-2">
              {blockTypes.map((block) => (
                <Button
                  key={block.type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addBlock(block.type)}
                >
                  <Icon name={block.icon as any} className="mr-2 h-4 w-4" />
                  {block.label}
                </Button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold mb-4">Настройки страницы</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm mb-1 block">Название</label>
                  <Input
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">URL (slug)</label>
                  <Input
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Рабочая область */}
        <div className="col-span-6">
          <Card className="p-6">
            <div className="space-y-6">
              {blocks.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Icon name="Plus" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Добавьте первый блок из панели слева</p>
                </div>
              ) : (
                blocks.map((block) => (
                  <div
                    key={block.id}
                    className={`relative p-4 border-2 rounded-lg transition-all ${
                      selectedBlock === block.id
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setSelectedBlock(block.id)}
                  >
                    <div className="absolute -top-3 -right-3 flex gap-1 bg-background">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(block.id, 'up');
                        }}
                      >
                        <Icon name="ChevronUp" className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveBlock(block.id, 'down');
                        }}
                      >
                        <Icon name="ChevronDown" className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBlock(block.id);
                        }}
                      >
                        <Icon name="Trash" className="h-4 w-4" />
                      </Button>
                    </div>
                    {renderBlock(block)}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Панель свойств */}
        <div className="col-span-3">
          {selectedBlock && (
            <Card className="p-4 sticky top-24">
              <h3 className="font-bold mb-4">Редактировать блок</h3>
              {(() => {
                const block = blocks.find(b => b.id === selectedBlock);
                if (!block) return null;

                return (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm mb-1 block">Тип блока</label>
                      <Input value={block.type} disabled />
                    </div>
                    <div>
                      <label className="text-sm mb-1 block">Содержимое</label>
                      {block.type === 'text' || block.type === 'columns' ? (
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          rows={4}
                        />
                      ) : (
                        <Input
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                        />
                      )}
                    </div>
                    {block.type === 'image' && (
                      <div className="text-xs text-muted-foreground">
                        Введите URL изображения или загрузите файл
                      </div>
                    )}
                  </div>
                );
              })()}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}