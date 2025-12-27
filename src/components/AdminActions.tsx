import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import AdminActionsCard from '@/components/admin-actions/AdminActionsCard';
import AdminBanDialog from '@/components/admin-actions/AdminBanDialog';
import AdminMuteDialog from '@/components/admin-actions/AdminMuteDialog';
import AdminSuspendDialog from '@/components/admin-actions/AdminSuspendDialog';
import AdminEmailVerification from '@/components/admin-actions/AdminEmailVerification';

interface AdminActionsProps {
  username: string;
  userId: string;
}

const ADMIN_API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function AdminActions({ username, userId }: AdminActionsProps) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [emailVerificationOpen, setEmailVerificationOpen] = useState(false);
  
  const [banDays, setBanDays] = useState('7');
  const [banReason, setBanReason] = useState('');
  const [muteDays, setMuteDays] = useState('3');
  const [muteReason, setMuteReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('');
  
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingAction, setPendingAction] = useState<'ban' | 'mute' | 'suspend' | null>(null);
  const [pendingActionData, setPendingActionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  const getAdminId = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const sendVerificationCode = async (actionType: string, actionData: any) => {
    setLoading(true);
    const adminId = getAdminId();
    
    if (!adminId) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось определить ID администратора',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'send_verification_code',
          action_type: actionType,
          action_data: actionData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Код отправлен',
          description: data.message,
        });
        setPendingAction(actionType as any);
        setPendingActionData(actionData);
        setEmailVerificationOpen(true);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить код',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка отправки кода',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAndExecute = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Ошибка',
        description: 'Введите 6-значный код',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const adminId = getAdminId();

    try {
      const response = await fetch(ADMIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': adminId,
        },
        body: JSON.stringify({
          action: 'verify_and_execute',
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: data.message,
        });
        
        setEmailVerificationOpen(false);
        setVerificationCode('');
        
        if (pendingAction === 'ban') {
          setBanDialogOpen(false);
          setBanDays('7');
          setBanReason('');
        } else if (pendingAction === 'mute') {
          setMuteDialogOpen(false);
          setMuteDays('3');
          setMuteReason('');
        } else if (pendingAction === 'suspend') {
          setSuspendDialogOpen(false);
          setSuspendReason('');
          setSelectedTournament('');
        }
        
        setPendingAction(null);
        setPendingActionData(null);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось выполнить действие',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Ошибка выполнения действия',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanClick = () => {
    if (!banReason.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину бана',
        variant: 'destructive',
      });
      return;
    }

    const actionData = {
      user_id: userId,
      reason: banReason,
      duration_days: banDays === 'forever' ? null : banDays,
      is_permanent: banDays === 'forever',
    };

    sendVerificationCode('ban', actionData);
  };

  const handleMuteClick = () => {
    if (!muteReason.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину мута',
        variant: 'destructive',
      });
      return;
    }

    const actionData = {
      user_id: userId,
      reason: muteReason,
      duration_days: muteDays,
      is_permanent: false,
    };

    sendVerificationCode('mute', actionData);
  };

  const handleSuspendClick = () => {
    if (!suspendReason.trim() || !selectedTournament) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const actionData = {
      user_id: userId,
      tournament_id: selectedTournament,
      reason: suspendReason,
    };

    sendVerificationCode('suspend', actionData);
  };

  return (
    <>
      <AdminActionsCard
        onBanClick={() => setBanDialogOpen(true)}
        onMuteClick={() => setMuteDialogOpen(true)}
        onSuspendClick={() => setSuspendDialogOpen(true)}
      />

      <AdminBanDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        username={username}
        banDays={banDays}
        setBanDays={setBanDays}
        banReason={banReason}
        setBanReason={setBanReason}
        onConfirm={handleBanClick}
        loading={loading}
      />

      <AdminMuteDialog
        open={muteDialogOpen}
        onOpenChange={setMuteDialogOpen}
        username={username}
        muteDays={muteDays}
        setMuteDays={setMuteDays}
        muteReason={muteReason}
        setMuteReason={setMuteReason}
        onConfirm={handleMuteClick}
        loading={loading}
      />

      <AdminSuspendDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        username={username}
        selectedTournament={selectedTournament}
        setSelectedTournament={setSelectedTournament}
        suspendReason={suspendReason}
        setSuspendReason={setSuspendReason}
        onConfirm={handleSuspendClick}
        loading={loading}
      />

      <AdminEmailVerification
        open={emailVerificationOpen}
        onOpenChange={setEmailVerificationOpen}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        onConfirm={verifyAndExecute}
        loading={loading}
      />
    </>
  );
}
