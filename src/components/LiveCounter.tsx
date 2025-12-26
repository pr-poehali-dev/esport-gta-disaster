import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LiveCounterProps {
  targetCount: number;
  label: string;
  icon: string;
  color?: 'primary' | 'secondary' | 'accent';
}

const LiveCounter = ({ targetCount, label, icon, color = 'primary' }: LiveCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [targetCount]);

  const colorClasses = {
    primary: 'from-primary to-secondary',
    secondary: 'from-secondary to-accent',
    accent: 'from-accent to-primary'
  };

  return (
    <Card className={`border-${color}/30 bg-card/80 backdrop-blur hover:scale-105 transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
      <CardContent className="p-6 bg-slate-800">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[color]} rounded-full clip-corner flex items-center justify-center`}>
            <Icon name={icon} className="text-white" size={32} />
          </div>
          <div className="flex-1">
            <div className={`text-4xl font-black bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>+3000</div>
            <div className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
              {label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveCounter;