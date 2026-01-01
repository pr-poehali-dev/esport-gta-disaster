import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface DiscussionListProps {
  discussions: any[];
  selectedDiscussion: any;
  onSelectDiscussion: (id: number) => void;
  onTogglePin: (id: number, currentPin: boolean) => void;
  onToggleLock: (id: number, currentLock: boolean) => void;
  onEditDiscussion: (discussion: any) => void;
  onDeleteDiscussion: (id: number) => void;
  onOpenCreateDialog: () => void;
  canModerate: boolean;
  userRole: string;
}

export default function DiscussionList({
  discussions,
  selectedDiscussion,
  onSelectDiscussion,
  onTogglePin,
  onToggleLock,
  onEditDiscussion,
  onDeleteDiscussion,
  onOpenCreateDialog,
  canModerate,
  userRole,
}: DiscussionListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDiscussions = discussions.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.author_nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="md:col-span-1">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div>
              <CardTitle>Обсуждения</CardTitle>
              <CardDescription>Управление темами форума</CardDescription>
            </div>
            {canModerate && (
              <Button onClick={onOpenCreateDialog} size="sm">
                <Icon name="Plus" className="h-4 w-4 mr-2" />
                Создать
              </Button>
            )}
          </div>
          <div className="mt-4">
            <Input
              placeholder="Поиск по обсуждениям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
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
                    {canModerate && (
                      <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(discussion.id, discussion.is_pinned);
                          }}
                          title={discussion.is_pinned ? 'Открепить' : 'Закрепить'}
                        >
                          <Icon
                            name={discussion.is_pinned ? 'Pin' : 'PinOff'}
                            className="h-4 w-4"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(discussion.id, discussion.is_locked);
                          }}
                          title={discussion.is_locked ? 'Открыть' : 'Закрыть'}
                        >
                          <Icon
                            name={discussion.is_locked ? 'LockOpen' : 'Lock'}
                            className="h-4 w-4"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDiscussion(discussion);
                          }}
                          title="Редактировать"
                        >
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                        {['admin', 'founder', 'organizer'].includes(userRole) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDiscussion(discussion.id);
                            }}
                            title="Удалить"
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}