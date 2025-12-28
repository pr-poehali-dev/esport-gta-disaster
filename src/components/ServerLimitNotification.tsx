import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function ServerLimitNotification() {
  const [show, setShow] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 402) {
          setErrorCount(prev => prev + 1);
          setShow(true);
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    if (errorCount >= 2 && !show) {
      setShow(true);
    }
  }, [errorCount, show]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] max-w-2xl w-full px-4">
      <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
        <Icon name="AlertTriangle" className="h-5 w-5 text-orange-500" />
        <AlertTitle className="text-orange-900 dark:text-orange-100 font-bold">
          Превышен лимит запросов к серверу
        </AlertTitle>
        <AlertDescription className="text-orange-800 dark:text-orange-200 mt-2 space-y-3">
          <p>
            Достигнут лимит вызовов backend функций на текущем тарифе. 
            Некоторые функции сайта временно недоступны.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              size="sm" 
              onClick={() => window.open('https://poehali.dev/p/pay', '_blank')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Icon name="CreditCard" className="h-4 w-4 mr-2" />
              Обновить подписку
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShow(false)}
            >
              <Icon name="X" className="h-4 w-4 mr-2" />
              Закрыть
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
