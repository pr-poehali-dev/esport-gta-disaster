import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface DiscussionDetailProps {
  selectedDiscussion: any;
  commentText: string;
  setCommentText: (text: string) => void;
  onAddComment: () => void;
  loading: boolean;
  canModerate: boolean;
}

export default function DiscussionDetail({
  selectedDiscussion,
  commentText,
  setCommentText,
  onAddComment,
  loading,
  canModerate,
}: DiscussionDetailProps) {
  if (!selectedDiscussion) {
    return (
      <div className="md:col-span-2">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Icon name="MessageSquare" className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Выберите обсуждение из списка</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="md:col-span-2">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {selectedDiscussion.is_pinned && (
                  <Icon name="Pin" className="h-4 w-4 text-primary" />
                )}
                {selectedDiscussion.is_locked && (
                  <Icon name="Lock" className="h-4 w-4 text-muted-foreground" />
                )}
                <CardTitle>{selectedDiscussion.title}</CardTitle>
              </div>
              <CardDescription>
                Автор: {selectedDiscussion.author_nickname} •{' '}
                {new Date(selectedDiscussion.created_at).toLocaleString('ru-RU')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="whitespace-pre-wrap">{selectedDiscussion.content}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="MessageSquare" className="h-4 w-4" />
              Комментарии ({selectedDiscussion.comments?.length || 0})
            </h3>

            <div className="space-y-3 mb-4">
              {selectedDiscussion.comments?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Комментариев пока нет</p>
              ) : (
                selectedDiscussion.comments?.map((comment: any) => (
                  <div key={comment.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{comment.author_nickname}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {canModerate && !selectedDiscussion.is_locked && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Добавить комментарий..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                />
                <Button onClick={onAddComment} disabled={loading || !commentText.trim()}>
                  <Icon name="Send" className="h-4 w-4 mr-2" />
                  Отправить комментарий
                </Button>
              </div>
            )}

            {selectedDiscussion.is_locked && (
              <div className="p-3 bg-muted rounded-lg text-center">
                <Icon name="Lock" className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Обсуждение закрыто, новые комментарии добавлять нельзя
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
