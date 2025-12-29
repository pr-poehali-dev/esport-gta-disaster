-- Создаем тестовое уведомление для основателя
INSERT INTO t_p4831367_esport_gta_disaster.notifications 
(user_id, type, title, message, data, created_at)
VALUES (
    2,
    'welcome',
    'Добро пожаловать, Основатель!',
    'Вы получили роль Основателя и статус Разработчик. Теперь у вас максимальные права в системе!',
    '{"level": 100, "role": "founder"}',
    NOW()
);