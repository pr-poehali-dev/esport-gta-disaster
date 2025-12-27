import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function Payment() {
  const [amount, setAmount] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  const handlePayment = (method: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректную сумму',
        variant: 'destructive'
      });
      return;
    }

    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=Payment:${amount}RUB:${method}`);
    setShowQR(true);

    toast({
      title: 'QR-код сгенерирован',
      description: 'Отсканируйте код для оплаты'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Пополнение счёта</h1>
          <p className="text-muted-foreground">
            Выберите удобный способ оплаты через QR-код
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Сумма пополнения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Введите сумму (₽)</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                  min="1"
                />
              </div>

              <Tabs defaultValue="sbp" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sbp">СБП</TabsTrigger>
                  <TabsTrigger value="yukassa">ЮKassa</TabsTrigger>
                </TabsList>
                <TabsContent value="sbp" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Оплата через Систему Быстрых Платежей
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handlePayment('СБП')}
                  >
                    <Icon name="QrCode" className="mr-2 h-4 w-4" />
                    Создать QR-код СБП
                  </Button>
                </TabsContent>
                <TabsContent value="yukassa" className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Оплата через ЮKassa (все способы)
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handlePayment('ЮKassa')}
                  >
                    <Icon name="QrCode" className="mr-2 h-4 w-4" />
                    Создать QR-код ЮKassa
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Icon name="Shield" className="h-4 w-4" />
                  <span>Быстрые суммы</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['500', '1000', '2000'].map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(value)}
                    >
                      {value} ₽
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR-код для оплаты</CardTitle>
            </CardHeader>
            <CardContent>
              {showQR ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                    <img src={qrCodeUrl} alt="QR код" className="w-64 h-64" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-semibold text-lg">Сумма: {amount} ₽</p>
                    <p className="text-sm text-muted-foreground">
                      Отсканируйте QR-код в приложении банка
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setShowQR(false);
                        setQrCodeUrl('');
                      }}
                    >
                      <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                      Создать новый
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Icon name="QrCode" className="h-24 w-24 mb-4 opacity-50" />
                  <p>Введите сумму и выберите способ оплаты</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/payment-history')}
            className="w-full"
          >
            <Icon name="History" className="mr-2 h-4 w-4" />
            История платежей
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
