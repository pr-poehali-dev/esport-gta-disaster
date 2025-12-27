import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function CMS() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const userData = JSON.parse(user);
      if (!['founder', 'admin'].includes(userData.role)) {
        navigate('/');
      }
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">CMS Панель Управления</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Eye" className="mr-2 h-4 w-4" />
              Просмотр сайта
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <Icon name="Settings" className="mr-2 h-4 w-4" />
              Админ-панель
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard">
              <Icon name="LayoutDashboard" className="mr-2 h-4 w-4" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="pages">
              <Icon name="FileText" className="mr-2 h-4 w-4" />
              Страницы
            </TabsTrigger>
            <TabsTrigger value="design">
              <Icon name="Palette" className="mr-2 h-4 w-4" />
              Дизайн
            </TabsTrigger>
            <TabsTrigger value="navigation">
              <Icon name="Menu" className="mr-2 h-4 w-4" />
              Навигация
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Icon name="Search" className="mr-2 h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Icon name="Settings" className="mr-2 h-4 w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Посетители</CardTitle>
                  <Icon name="Users" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+20% с прошлого месяца</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Страниц</CardTitle>
                  <Icon name="FileText" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">активных страниц</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">Обновления</CardTitle>
                  <Icon name="Clock" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">за последнюю неделю</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <Button className="h-24" onClick={() => setActiveTab('pages')}>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="FilePlus" className="h-6 w-6" />
                    <span>Создать страницу</span>
                  </div>
                </Button>
                <Button className="h-24" onClick={() => setActiveTab('design')}>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="Paintbrush" className="h-6 w-6" />
                    <span>Изменить дизайн</span>
                  </div>
                </Button>
                <Button className="h-24" onClick={() => navigate('/admin/tournaments')}>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="Trophy" className="h-6 w-6" />
                    <span>Управление турнирами</span>
                  </div>
                </Button>
                <Button className="h-24" onClick={() => navigate('/admin/users')}>
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="Users" className="h-6 w-6" />
                    <span>Управление пользователями</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление страницами</CardTitle>
                <Button onClick={() => navigate('/cms/page-editor')}>
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Создать страницу
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Главная', 'О нас', 'Команды', 'Турниры', 'Рейтинг', 'Контакты'].map((page) => (
                    <div key={page} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Icon name="FileText" className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{page}</div>
                          <div className="text-sm text-muted-foreground">
                            /{page.toLowerCase().replace(/\s+/g, '-')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Icon name="Eye" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="design">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Цветовая схема</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Основной цвет</label>
                    <div className="flex items-center gap-4">
                      <input type="color" defaultValue="#0D94E7" className="w-16 h-16 rounded" />
                      <span className="text-sm text-muted-foreground">#0D94E7</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Акцентный цвет</label>
                    <div className="flex items-center gap-4">
                      <input type="color" defaultValue="#A855F7" className="w-16 h-16 rounded" />
                      <span className="text-sm text-muted-foreground">#A855F7</span>
                    </div>
                  </div>
                  <Button className="w-full">Сохранить цвета</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Типографика</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Шрифт заголовков</label>
                    <select className="w-full p-2 border rounded">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Montserrat</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Шрифт основного текста</label>
                    <select className="w-full p-2 border rounded">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                    </select>
                  </div>
                  <Button className="w-full">Сохранить шрифты</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="navigation">
            <Card>
              <CardHeader>
                <CardTitle>Главное меню</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {['Главная', 'Обсуждения', 'Команды', 'Турниры', 'Рейтинг'].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Icon name="GripVertical" className="h-4 w-4 text-muted-foreground cursor-move" />
                        <span>{item}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Icon name="Edit" className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icon name="Trash" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить пункт меню
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO настройки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Название сайта</label>
                  <input 
                    type="text" 
                    defaultValue="DISASTER ESPORTS" 
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Описание</label>
                  <textarea 
                    rows={3}
                    defaultValue="Профессиональная киберспортивная организация"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ключевые слова</label>
                  <input 
                    type="text" 
                    defaultValue="киберспорт, gta, турниры, esports"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <Button className="w-full">Сохранить SEO</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Общие настройки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название сайта</label>
                    <input 
                      type="text" 
                      defaultValue="DISASTER ESPORTS"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Домен</label>
                    <input 
                      type="text" 
                      defaultValue="disaster-esports.ru"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <Button className="w-full">Сохранить</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Резервное копирование</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Последнее копирование: сегодня в 03:00
                  </div>
                  <Button className="w-full" variant="outline">
                    <Icon name="Download" className="mr-2 h-4 w-4" />
                    Создать резервную копию
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Icon name="Upload" className="mr-2 h-4 w-4" />
                    Восстановить из копии
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
