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
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredDiscussions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Обсуждения не найдены</p>
          ) : (
            filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                  selectedDiscussion?.id === discussion.id ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => onSelectDiscussion(discussion.id)}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {discussion.is_pinned && (
                        <Icon name="Pin" className="h-3 w-3 text-primary" />
                      )}
                      {discussion.is_locked && (
                        <Icon name="Lock" className="h-3 w-3 text-muted-foreground" />
                      )}
                      <h4 className="font-semibold text-sm">{discussion.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Автор: {discussion.author_nickname} • {discussion.comments_count} комментариев
                    </p>
                  </div>
                  {canModerate && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(discussion.id, discussion.is_pinned);
                        }}
                      >
                        <Icon
                          name={discussion.is_pinned ? 'Pin' : 'PinOff'}
                          className="h-4 w-4"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(discussion.id, discussion.is_locked);
                        }}
                      >
                        <Icon
                          name={discussion.is_locked ? 'Lock' : 'LockOpen'}
                          className="h-4 w-4"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDiscussion(discussion);
                        }}
                      >
                        <Icon name="Edit" className="h-4 w-4" />
                      </Button>
                      {['admin', 'founder', 'organizer'].includes(userRole) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDiscussion(discussion.id);
                          }}
                        >
                          <Icon name="Trash2" className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
