-- Создаем контент поддержки по умолчанию
INSERT INTO support_contacts (content, updated_by, updated_at) 
VALUES (
    E'Для связи с нами используйте следующие контакты:\n\nTelegram: [Написать в Telegram](https://t.me/disasteresports)\n\nDiscord: [Присоединиться к Discord](https://discord.gg/disaster)\n\nEmail: support@disasteresports.ru\n\nМы отвечаем в течение 24 часов.\n\nРабочее время: ПН-ПТ 10:00-18:00 (МСК)',
    2,
    NOW()
);