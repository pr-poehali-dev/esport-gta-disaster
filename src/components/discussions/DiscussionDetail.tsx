import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface Comment {
  id: number;
  author_nickname: string;
  content: string;
  created_at: string;
  image_url?: string;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  author_nickname: string;
  created_at: string;
  is_pinned: boolean;
  is_locked: boolean;
  comments?: Comment[];
}

interface DiscussionDetailProps {
  discussion: Discussion;
  isAdmin: boolean;
  loading: boolean;
  commentText: string;
  imagePreview: string;
  onCommentTextChange: (text: string) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onAddComment: () => void;
  onTogglePin: (discussionId: number, currentPinned: boolean) => void;
  onToggleLock: (discussionId: number, currentLocked: boolean) => void;
}

export default function DiscussionDetail({
  discussion,
  isAdmin,
  loading,
  commentText,
  imagePreview,
  onCommentTextChange,
  onImageSelect,
  onRemoveImage,
  onAddComment,
  onTogglePin,
  onToggleLock,
}: DiscussionDetailProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-wrap">
              {discussion.is_pinned && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  <Icon name="Pin" className="h-3.5 w-3.5" />
                  Закреплено
                </div>
              )}
              {discussion.is_locked && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                  <Icon name="Lock" className="h-3.5 w-3.5" />
                  Закрыто
                </div>
              )}
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTogglePin(discussion.id, discussion.is_pinned)}
                  disabled={loading}
                >
                  <Icon name={discussion.is_pinned ? "PinOff" : "Pin"} size={14} className="mr-1" />
                  {discussion.is_pinned ? 'Открепить' : 'Закрепить'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleLock(discussion.id, discussion.is_locked)}
                  disabled={loading}
                >
                  <Icon name={discussion.is_locked ? "Unlock" : "Lock"} size={14} className="mr-1" />
                  {discussion.is_locked ? 'Разблокировать' : 'Заблокировать'}
                </Button>
              </div>
            )}
          </div>
          <div>
            <CardTitle className="text-xl mb-2">{discussion.title}</CardTitle>
            <CardDescription className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Icon name="User" className="h-3.5 w-3.5" />
                {discussion.author_nickname}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Calendar" className="h-3.5 w-3.5" />
                {new Date(discussion.created_at).toLocaleString('ru-RU')}
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="p-5 bg-muted/50 rounded-lg border">
          <p className="whitespace-pre-wrap leading-relaxed">{discussion.content}</p>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Icon name="MessageSquare" className="h-5 w-5" />
            Комментарии
            <span className="text-sm font-normal text-muted-foreground">({discussion.comments?.length || 0})</span>
          </h3>

          <div className="space-y-3 mb-6">
            {discussion.comments?.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg">
                <Icon name="MessageCircle" className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-sm">Комментариев пока нет. Будьте первым!</p>
              </div>
            ) : (
              discussion.comments?.map((comment) => (
                <div key={comment.id} className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon name="User" className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm font-semibold">{comment.author_nickname}</p>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Icon name="Clock" className="h-3 w-3" />
                      {new Date(comment.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed pl-10">{comment.content}</p>
                  {comment.image_url && (
                    <div className="mt-3 pl-10">
                      <img 
                        src={comment.image_url} 
                        alt="Прикрепленное изображение" 
                        className="rounded-lg max-w-md max-h-96 object-contain border"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {!discussion.is_locked ? (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
              <label className="text-sm font-medium flex items-center gap-2">
                <Icon name="Edit3" className="h-4 w-4" />
                Новый комментарий
              </label>
              <Textarea
                placeholder="Напишите свой комментарий..."
                value={commentText}
                onChange={(e) => onCommentTextChange(e.target.value)}
                rows={4}
                className="resize-none"
              />
              
              {imagePreview && (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="rounded-lg max-h-32 object-contain border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={onRemoveImage}
                  >
                    <Icon name="X" className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={onImageSelect}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Icon name="Image" className="h-4 w-4 mr-2" />
                    Прикрепить фото
                  </Button>
                </div>
                <Button onClick={onAddComment} disabled={loading || !commentText.trim()}>
                  <Icon name="Send" className="h-4 w-4 mr-2" />
                  Отправить
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-muted/50 rounded-lg border text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                <Icon name="Lock" className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">Обсуждение закрыто</p>
              <p className="text-xs text-muted-foreground">
                Новые комментарии добавлять нельзя
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
