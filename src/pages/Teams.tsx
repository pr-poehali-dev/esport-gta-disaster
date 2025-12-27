import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface Team {
  id: string;
  name: string;
  tag: string;
  logo_url: string | null;
  member_count: number;
  wins: number;
  losses: number;
  win_rate: number;
  verified: boolean;
  created_at: string;
  description?: string;
}

export default function Teams() {
  const headerAnimation = useScrollAnimation();
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/a4eec727-e4f2-4b3c-b8d3-06dbb78ab515');
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить команды');
      }

      const data = await response.json();
      setTeams(data.teams || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.tag?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={headerAnimation.ref}
            className={`text-center mb-12 transition-all duration-700 ${
              headerAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="text-5xl sm:text-6xl font-black mb-4">
              Зарегистрированные <span className="text-gradient">Команды</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Только подтвержденные команды, готовые к турнирам
            </p>

            <div className="max-w-md mx-auto relative">
              <Icon
                name="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Поиск по названию или тегу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary font-mono"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-lg text-muted-foreground">Загрузка команд...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Icon name="AlertCircle" className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">{error}</p>
              <button
                onClick={fetchTeams}
                className="px-6 py-2 bg-primary text-background font-bold font-mono hover:bg-primary/90 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="Users" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                {searchQuery ? 'Команды не найдены' : 'Пока нет зарегистрированных команд'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, index) => (
                <TeamCard key={team.id} team={team} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  const cardAnimation = useScrollAnimation({ threshold: 0.2 });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getTeamLogo = () => {
    if (team.logo_url) {
      return <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-full" />;
    }
    const firstLetter = team.name.charAt(0).toUpperCase();
    return <span className="text-3xl font-black text-gradient">{firstLetter}</span>;
  };

  return (
    <div
      ref={cardAnimation.ref}
      className={`gradient-border bg-card p-6 hover-lift group relative overflow-hidden transition-all duration-700 ${
        cardAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center digital-glow overflow-hidden">
              {getTeamLogo()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-foreground font-mono">
                  {team.name}
                </h3>
                {team.verified && (
                  <Icon name="CheckCircle" className="h-5 w-5 text-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                [{team.tag || 'NO TAG'}]
              </p>
            </div>
          </div>
        </div>

        {team.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team.description}
          </p>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-black text-gradient font-mono">
              {team.wins}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Побед
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-muted-foreground font-mono">
              {team.losses}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Поражений
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-primary font-mono">
              {team.win_rate}%
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Винрейт
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Users" className="h-4 w-4" />
            <span className="font-mono">{team.member_count} игроков</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {formatDate(team.created_at)}
          </div>
        </div>
      </div>
    </div>
  );
}