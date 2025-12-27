import Logo from './Logo';
import Icon from '@/components/ui/icon';

export default function Footer() {
  const socialLinks = [
    { icon: 'Youtube', href: '#' },
    { icon: 'Twitter', href: '#' },
    { icon: 'Instagram', href: '#' },
    { icon: 'Twitch', href: '#' },
  ];

  const links = {
    'Организация': ['О нас', 'Команда', 'Вакансии', 'Контакты'],
    'Киберспорт': ['Турниры', 'Расписание', 'Результаты', 'Статистика'],
    'Сообщество': ['Новости', 'Форум', 'Discord', 'Магазин'],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <Logo showText={true} animated={false} />
            <p className="text-sm text-muted-foreground max-w-md">
              Профессиональная киберспортивная организация. Мы превращаем талант в победы и доминируем на мировой арене.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  className="w-10 h-10 bg-muted hover:bg-primary/20 border border-transparent hover:border-primary flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon
                    name={social.icon as any}
                    className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 DISASTER ESPORTS. Все права защищены.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Условия использования
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
