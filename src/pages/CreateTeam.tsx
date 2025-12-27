import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AUTH_API_URL = 'https://functions.poehali.dev/48b769d9-54a9-49a4-a89a-6089b61817f4';

interface TeamMember {
  email: string;
  isReserve: boolean;
}

export default function CreateTeam() {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [website, setWebsite] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([
    { email: '', isReserve: false }
  ]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, { email: '', isReserve: members.length >= 3 }]);
    }
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string | boolean) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const createTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите название команды',
        variant: 'destructive'
      });
      return;
    }

    const mainPlayers = members.filter(m => !m.isReserve && m.email.trim());
    if (mainPlayers.length < 1) {
      toast({
        title: 'Ошибка',
        description: 'Добавьте хотя бы одного игрока',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      const teamData: any = {
        action: 'create_team',
        tournament_id: tournamentId,
        name: teamName,
        website: website || null,
        members: members.filter(m => m.email.trim()).map(m => ({
          email: m.email,
          is_reserve: m.isReserve
        }))
      };

      if (logoFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          teamData.logo_base64 = (reader.result as string).split(',')[1];
          await submitTeam(teamData, sessionToken);
        };
        reader.readAsDataURL(logoFile);
      } else {
        await submitTeam(teamData, sessionToken);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать команду',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const submitTeam = async (teamData: any, sessionToken: string | null) => {
    const response = await fetch(AUTH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': sessionToken || ''
      },
      body: JSON.stringify(teamData)
    });

    const data = await response.json();

    if (response.ok) {
      toast({
        title: 'Команда создана!',
        description: 'Приглашения отправлены участникам'
      });
      navigate(`/tournaments/${tournamentId}/bracket`);
    } else {
      toast({
        title: 'Ошибка',
        description: data.error || 'Не удалось создать команду',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <h1 className="text-4xl font-black mb-8">Создать команду</h1>

          <Card className="p-6 space-y-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">Название команды *</label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team Awesome"
                maxLength={100}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Логотип команды</label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo preview" className="w-20 h-20 rounded object-cover" />
                )}
                <label className="cursor-pointer">
                  <div className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded border border-primary/30 flex items-center gap-2 transition-colors">
                    <Icon name="Upload" className="h-4 w-4" />
                    <span>Загрузить логотип</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Сайт команды</label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://teamawesome.com"
                type="url"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold">Участники команды *</label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addMember}
                  disabled={members.length >= 5}
                >
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        placeholder="Email участника"
                        type="email"
                      />
                    </div>
                    {index >= 3 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Users" className="h-4 w-4" />
                        <span>Запасной</span>
                      </div>
                    )}
                    {members.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMember(index)}
                      >
                        <Icon name="X" className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Минимум 1 игрок, максимум 5 (3 основных + 2 запасных).
                Игроки получат приглашение и должны подтвердить его в личном кабинете.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={createTeam}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2 h-4 w-4" />
                  Создание...
                </>
              ) : (
                <>
                  <Icon name="Check" className="mr-2 h-4 w-4" />
                  Создать команду
                </>
              )}
            </Button>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
