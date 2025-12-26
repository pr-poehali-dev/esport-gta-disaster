import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { playHoverSound } from '@/utils/sounds';

interface StreamData {
  id: number;
  title: string;
  platform: 'twitch' | 'youtube';
  streamer: string;
  viewers: number;
  isLive: boolean;
  thumbnail: string;
  url: string;
}

interface ScheduleItem {
  id: number;
  date: string;
  time: string;
  title: string;
  platform: 'twitch' | 'youtube';
  streamer: string;
}

const StreamSection = () => {
  const [activeStream, setActiveStream] = useState<'twitch' | 'youtube'>('twitch');

  const streams: StreamData[] = [
    {
      id: 1,
      title: 'ФИНАЛ ТУРНИРА - DISASTER ESPORTS',
      platform: 'twitch',
      streamer: 'disaster_esports',
      viewers: 2847,
      isLive: true,
      thumbnail: '🎮',
      url: 'https://twitch.tv/disaster_esports'
    },
    {
      id: 2,
      title: 'Разбор стратегий с чемпионом',
      platform: 'youtube',
      streamer: 'DISASTER ESPORTS',
      viewers: 1523,
      isLive: false,
      thumbnail: '🏆',
      url: 'https://youtube.com/@disaster_esports'
    }
  ];

  const schedule: ScheduleItem[] = [
    {
      id: 1,
      date: '25 января',
      time: '19:00 МСК',
      title: 'Финал сезона 2025 - Прямой эфир',
      platform: 'twitch',
      streamer: 'disaster_esports'
    },
    {
      id: 2,
      date: '20 января',
      time: '18:00 МСК',
      title: 'Полуфинал - ТОП-4 игрока',
      platform: 'twitch',
      streamer: 'disaster_esports'
    },
    {
      id: 3,
      date: '15 января',
      time: '20:00 МСК',
      title: 'Четвертьфинал - Битва за выход',
      platform: 'youtube',
      streamer: 'DISASTER ESPORTS'
    },
    {
      id: 4,
      date: '10 января',
      time: '19:00 МСК',
      title: 'Отборочные туры - День 2',
      platform: 'twitch',
      streamer: 'disaster_esports'
    }
  ];

  const liveStream = streams.find(s => s.isLive && s.platform === activeStream);

  return (
    <section id="streams" className="relative z-10 py-20 bg-gradient-to-b from-transparent via-secondary/5 to-transparent">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black mb-4 text-white">Прямые трансляции</h3>
          <p className="text-muted-foreground">Смотри турниры онлайн и общайся с другими фанатами</p>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-primary/30 bg-card/80 backdrop-blur neon-border overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Icon name="Radio" className="text-primary animate-pulse" size={24} />
                    Сейчас в эфире
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={activeStream === 'twitch' ? 'default' : 'outline'}
                      onClick={() => setActiveStream('twitch')}
                      onMouseEnter={playHoverSound}
                      className="gap-2"
                    >
                      <Icon name="Tv" size={16} />
                      Twitch
                    </Button>
                    <Button
                      size="sm"
                      variant={activeStream === 'youtube' ? 'default' : 'outline'}
                      onClick={() => setActiveStream('youtube')}
                      onMouseEnter={playHoverSound}
                      className="gap-2"
                    >
                      <Icon name="Youtube" size={16} />
                      YouTube
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {liveStream ? (
                  <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-8xl mb-4">{liveStream.thumbnail}</div>
                      <Badge className="mb-4 bg-red-500/20 text-red-400 border-red-500/50 animate-pulse px-4 py-2">
                        <Icon name="Radio" className="mr-2" size={16} />
                        LIVE • {liveStream.viewers.toLocaleString()} зрителей
                      </Badge>
                      <h4 className="text-2xl font-bold mb-2">{liveStream.title}</h4>
                      <p className="text-muted-foreground mb-6">{liveStream.streamer}</p>
                      <Button
                        size="lg"
                        onClick={() => window.open(liveStream.url, '_blank')}
                        onMouseEnter={playHoverSound}
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-bold"
                      >
                        <Icon name="Play" className="mr-2" size={20} />
                        Смотреть трансляцию
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-background to-primary/5 flex items-center justify-center p-8">
                    <div className="text-center">
                      <Icon name="RadioOff" size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground text-lg">Трансляция не активна</p>
                      <p className="text-sm text-muted-foreground mt-2">Следующий стрим по расписанию →</p>
                    </div>
                  </div>
                )}

                <div className="p-6 border-t border-primary/20">
                  <h5 className="font-bold mb-4 flex items-center gap-2">
                    <Icon name="MessageCircle" size={18} />
                    Чат трансляции
                  </h5>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-bold text-xs">
                        R
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">RAZOR_PRO</span>
                          <span className="text-xs text-muted-foreground">2 мин назад</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Этот матч был невероятным! 🔥</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center font-bold text-xs">
                        C
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">CyberKnight</span>
                          <span className="text-xs text-muted-foreground">5 мин назад</span>
                        </div>
                        <p className="text-sm text-muted-foreground">GG WP! Жду реванш в следующем сезоне</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center font-bold text-xs">
                        N
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm">NeonDrift</span>
                          <span className="text-xs text-muted-foreground">8 мин назад</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Тактика на высоте! 👏</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Написать в чат..."
                      className="flex-1 px-4 py-2 bg-background/50 border border-primary/30 rounded focus:outline-none focus:border-primary text-sm"
                    />
                    <Button size="sm" onMouseEnter={playHoverSound}>
                      <Icon name="Send" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-primary/30 bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Calendar" className="text-secondary" size={20} />
                  Расписание стримов
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {schedule.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 bg-background/50 rounded border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon 
                            name={item.platform === 'twitch' ? 'Tv' : 'Youtube'} 
                            size={14} 
                            className="text-primary" 
                          />
                          <span className="text-xs text-muted-foreground">{item.streamer}</span>
                        </div>
                        <h6 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h6>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Calendar" size={12} />
                            {item.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-card/80 backdrop-blur mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Bell" className="text-accent" size={20} />
                  Уведомления
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Подпишись, чтобы не пропустить начало трансляций
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onMouseEnter={playHoverSound}
                  >
                    <Icon name="Tv" size={16} />
                    Twitch: disaster_esports
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onMouseEnter={playHoverSound}
                  >
                    <Icon name="Youtube" size={16} />
                    YouTube: DISASTER ESPORTS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StreamSection;
