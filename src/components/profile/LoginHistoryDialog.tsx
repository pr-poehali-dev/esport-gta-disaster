import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const PROFILE_API_URL = 'https://functions.poehali.dev/40668e0d-ec0a-41a3-95c1-34a0140e1c15';

interface LoginHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LoginLog {
  id: number;
  ip_address: string;
  user_agent: string;
  country: string;
  city: string;
  login_successful: boolean;
  login_method: string;
  created_at: string;
}

export default function LoginHistoryDialog({ open, onOpenChange }: LoginHistoryDialogProps) {
  const [loginHistory, setLoginHistory] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadLoginHistory();
    }
  }, [open]);

  const loadLoginHistory = async () => {
    setLoading(true);
    try {
      const sessionToken = localStorage.getItem('session_token');
      const response = await fetch(PROFILE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken || '',
        },
        body: JSON.stringify({
          action: 'get_login_history',
          limit: 20,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoginHistory(data.login_history || []);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось загрузить историю входов',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить историю входов',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Неизвестно';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a0e1a] border-white/10 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Icon name="Shield" className="h-5 w-5" />
            История входов
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Последние 20 попыток входа в ваш аккаунт
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : loginHistory.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Icon name="Info" className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>История входов пуста</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loginHistory.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border ${
                  log.login_successful
                    ? 'bg-[#1a1f2e] border-green-500/20'
                    : 'bg-red-900/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {log.login_successful ? (
                        <Icon name="CheckCircle" className="h-5 w-5 text-green-500" />
                      ) : (
                        <Icon name="XCircle" className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-white font-medium">
                        {log.login_successful ? 'Успешный вход' : 'Неудачная попытка'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm pl-8">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Icon name="MapPin" className="h-4 w-4" />
                        <span>
                          {log.country !== 'Unknown' && log.city !== 'Unknown'
                            ? `${log.city}, ${log.country}`
                            : log.country !== 'Unknown'
                            ? log.country
                            : 'Неизвестно'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <Icon name="Globe" className="h-4 w-4" />
                        <span className="font-mono">{log.ip_address}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <Icon name="Monitor" className="h-4 w-4" />
                        <span>{getBrowserInfo(log.user_agent)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <Icon name="Key" className="h-4 w-4" />
                        <span className="capitalize">{log.login_method}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            <Icon name="Info" className="h-4 w-4 inline mr-2" />
            Если вы заметили подозрительную активность, немедленно смените пароль
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
