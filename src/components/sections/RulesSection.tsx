import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const RulesSection = () => {
  return (
    <section id="rules" className="relative z-10 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-black mb-4 text-white">Правила турнира</h3>
          <p className="text-muted-foreground">Ознакомьтесь с регламентом перед участием</p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6">
          <Card className="border-primary/30 bg-card/80 backdrop-blur hover:border-primary/60 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon name="Users" className="text-primary" size={24} />
                Участие
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>• Регистрация обязательна через форму на сайте</p>
              <p>• Возраст участников: от 16 лет</p>
              <p>• Обязательное наличие Discord для связи</p>
              <p>• Один игрок = одна заявка</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/80 backdrop-blur hover:border-primary/60 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon name="Trophy" className="text-secondary" size={24} />
                Формат турнира
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>• Система: одиночная сетка с выбыванием</p>
              <p>• Режим игры: 1v1 дуэль</p>
              <p>• Карта: Криминальная Россия (стандартная)</p>
              <p>• Время матча: до 3 побед (Best of 5)</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/80 backdrop-blur hover:border-primary/60 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon name="Ban" className="text-destructive" size={24} />
                Запреты и ограничения
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>• Читы и модификации: строгий запрет (дисквалификация)</p>
              <p>• Токсичное поведение: предупреждение/бан</p>
              <p>• Запрещенное оружие: RPG, минигун</p>
              <p>• Сговор и подставы: дисквалификация обоих участников</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/80 backdrop-blur hover:border-primary/60 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon name="Award" className="text-accent" size={24} />
                Призовой фонд
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>🥇 1 место: 50 000₽ + звание чемпиона</p>
              <p>🥈 2 место: 25 000₽</p>
              <p>🥉 3 место: 15 000₽</p>
              <p>• Выплаты в течение 7 дней после финала</p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-card/80 backdrop-blur hover:border-primary/60 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon name="Clock" className="text-primary" size={24} />
                Расписание
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>• Регистрация: до 31 декабря 2024</p>
              <p>• Отборочные: 5-10 января 2025</p>
              <p>• Плей-офф: 15-20 января 2025</p>
              <p>• Финал: 25 января 2025 (прямой эфир)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;
