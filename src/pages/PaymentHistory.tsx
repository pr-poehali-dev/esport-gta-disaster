import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
  payment_method?: string;
}

const mockPayments: Payment[] = [
  {
    id: 1,
    amount: 1000,
    currency: 'RUB',
    status: 'completed',
    description: 'Пополнение счёта',
    created_at: '2025-01-15T10:30:00',
    payment_method: 'QR СБП'
  },
  {
    id: 2,
    amount: 500,
    currency: 'RUB',
    status: 'pending',
    description: 'Регистрация на турнир',
    created_at: '2025-01-20T14:20:00',
    payment_method: 'QR ЮKassa'
  }
];

export default function PaymentHistory() {
  const [payments] = useState<Payment[]>(mockPayments);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      completed: { variant: 'default', label: 'Завершён' },
      pending: { variant: 'secondary', label: 'В обработке' },
      failed: { variant: 'destructive', label: 'Отклонён' }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">История платежей</h1>
          <p className="text-muted-foreground">
            Все ваши транзакции и платежи
          </p>
        </div>

        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Icon name="CreditCard" className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{payment.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleString('ru-RU')}
                      </div>
                      {payment.payment_method && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Способ: {payment.payment_method}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {payment.amount} {payment.currency}
                      </div>
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {payments.length === 0 && (
          <div className="text-center py-16">
            <Icon name="Inbox" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              У вас пока нет платежей
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
