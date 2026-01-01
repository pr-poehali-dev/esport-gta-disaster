import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Discussion {
  id: number;
  title: string;
  author_nickname: string;
  comments_count: number;
  is_pinned: boolean;
  is_locked: boolean;
}

interface DiscussionsListProps {
  discussions: Discussion[];
  selectedDiscussion: Discussion | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectDiscussion: (id: number) => void;
}

export default function DiscussionsList({
  discussions,
  selectedDiscussion,
  searchQuery,
  onSearchChange,
  onSelectDiscussion,
}: DiscussionsListProps) {
  const filteredDiscussions = discussions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.author_nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Темы обсуждений</CardTitle>
        <CardDescription>Выберите тему для просмотра</CardDescription>
        <div className="mt-4">
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Search" className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Обсуждения не найдены</p>
          </div>
        ) : (
          filteredDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                selectedDiscussion?.id === discussion.id 
                  ? 'bg-accent border-primary shadow-sm' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => onSelectDiscussion(discussion.id)}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {discussion.is_pinned && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      <Icon name="Pin" className="h-3 w-3" />
                      Закреплено
                    </div>
                  )}
                  {discussion.is_locked && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                      <Icon name="Lock" className="h-3 w-3" />
                      Закрыто
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{discussion.title}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="User" className="h-3 w-3" />
                    {discussion.author_nickname}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="MessageSquare" className="h-3 w-3" />
                    {discussion.comments_count}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
