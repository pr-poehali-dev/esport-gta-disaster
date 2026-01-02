import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_URL = 'https://functions.poehali.dev/6a86c22f-65cf-4eae-a945-4fc8d8feee41';

export default function AdminDeleteUsers() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const deleteUsers = async () => {
    if (!confirm('Вы уверены? Это удалит ВСЕ аккаунты кроме ID 2 (founder)!')) {
      return;
    }

    setLoading(true);
    setResult('Загрузка...');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Id': user.id?.toString() || '2'
        },
        body: JSON.stringify({
          action: 'delete_all_users_except_founder'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Успешно! ${data.message}`);
      } else {
        setResult(`❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`);
      }
    } catch (error: any) {
      setResult(`❌ Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="bg-[#1a1f2e] border-red-500/50 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-4">⚠️ Удаление пользователей</h1>
          <p className="text-gray-300 mb-6">
            Эта операция удалит ВСЕ аккаунты кроме ID 2 (founder).
            <br /><br />
            <strong className="text-red-400">Это действие необратимо!</strong>
          </p>

          <Button 
            onClick={deleteUsers} 
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 mb-4"
          >
            {loading ? 'Удаление...' : 'Удалить всех пользователей (кроме ID 2)'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${result.startsWith('✅') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {result}
            </div>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
}
