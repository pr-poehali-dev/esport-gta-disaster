import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import UserRoleBadge from '@/components/UserRoleBadge';

interface Match {
  id: number;
  result: 'win' | 'loss';
  kills: number;
  deaths: number;
  mvp: boolean;
  date: string;
}

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = {
    id: 1,
    nickname: 'ProPlayer123',
    avatar_url: null,
    role: 'user',
    auto_status: 'Освоившийся',
    rating: 1720,
    wins: 45,
    losses: 18,
    mvp_count: 12,
    discord: 'ProPlayer#1234',
    team: 'Team Alpha',
    custom_status: 'Готов побеждать! 🔥',
    created_at: '2024-06-15',
    show_discord: true,
    show_team: true,
    show_rating: true,
    show_stats: true
  };

  const matches: Match[] = [
    { id: 1, result: 'win', kills: 24, deaths: 15, mvp: true, date: '2025-01-10' },
    { id: 2, result: 'loss', kills: 18, deaths: 20, mvp: false, date: '2025-01-08' },
    { id: 3, result: 'win', kills: 22, deaths: 12, mvp: true, date: '2025-01-05' }
  ];

  const getRatingColor = (rating: number) => {
    if (rating >= 1700) return 'text-yellow-500';
    if (rating >= 1500) return 'text-purple-500';
    if (rating >= 1300) return 'text-blue-500';
    return 'text-green-500';
  };

  const kd = (user.wins * 20 / Math.max(user.losses * 15, 1)).toFixed(2);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Назад
          </Button>

          <Card className="p-8 mb-6">
            <div className="flex items-start gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.nickname} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Icon name="User" className="h-16 w-16 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-5xl font-black">{user.nickname}</h1>
                  <UserRoleBadge role={user.role} autoStatus={user.auto_status} />
                </div>

                {user.custom_status && (
                  <p className="text-lg text-muted-foreground mb-4">{user.custom_status}</p>
                )}

                <div className="grid grid-cols-2 gap-6 mb-4">
                  {user.show_discord && user.discord && (
                    <div className="flex items-center gap-2">
                      <Icon name="MessageSquare" className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{user.discord}</span>
                    </div>
                  )}
                  {user.show_team && user.team && (
                    <div className="flex items-center gap-2">
                      <Icon name="Users" className="h-5 w-5 text-muted-foreground" />
                      <button onClick={() => navigate('/teams/1')} className="text-sm hover:text-primary transition-colors">
                        {user.team}
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">На сайте с {new Date(user.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {user.show_stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {user.show_rating && (
                <Card className="p-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Рейтинг</div>
                  <div className={`text-4xl font-black ${getRatingColor(user.rating)}`}>{user.rating}</div>
                </Card>
              )}

              <Card className="p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Побед</div>
                <div className="text-4xl font-black text-green-500">{user.wins}</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Поражений</div>
                <div className="text-4xl font-black text-red-500">{user.losses}</div>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">MVP</div>
                <div className="text-4xl font-black text-yellow-500">{user.mvp_count}</div>
              </Card>
            </div>
          )}

          <Card className="p-6">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
              <Icon name="History" className="h-6 w-6" />
              Последние матчи
            </h2>

            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant={match.result === 'win' ? 'default' : 'destructive'}>
                      {match.result === 'win' ? 'Победа' : 'Поражение'}
                    </Badge>
                    {match.mvp && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500">
                        <Icon name="Award" className="h-3 w-3 mr-1" />
                        MVP
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">K/D:</span>{' '}
                      <span className="font-bold">{match.kills}/{match.deaths}</span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(match.date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
