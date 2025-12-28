import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: {
    nickname: string;
    discord: string;
    team: string;
    bio: string;
    signature_url: string;
  };
  setEditData: (data: any) => void;
  handleSaveProfile: () => void;
  loading: boolean;
}

export default function ProfileEditDialog({
  open,
  onOpenChange,
  editData,
  setEditData,
  handleSaveProfile,
  loading,
}: ProfileEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование профиля</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-semibold mb-2 block">Имя пользователя *</label>
            <Input
              value={editData.nickname}
              onChange={(e) => setEditData({ ...editData, nickname: e.target.value })}
              placeholder="Введите имя пользователя"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Discord</label>
            <Input
              value={editData.discord}
              onChange={(e) => setEditData({ ...editData, discord: e.target.value })}
              placeholder="username#0000"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Команда</label>
            <Input
              value={editData.team}
              onChange={(e) => setEditData({ ...editData, team: e.target.value })}
              placeholder="Название команды"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Биография</label>
            <Textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              placeholder="Расскажите о себе"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">URL подписи (изображение/видео)</label>
            <Input
              value={editData.signature_url}
              onChange={(e) => setEditData({ ...editData, signature_url: e.target.value })}
              placeholder="https://example.com/signature.png"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full"
          >
            {loading ? <Icon name="Loader2" className="animate-spin mr-2" size={20} /> : <Icon name="Save" className="mr-2" size={20} />}
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
