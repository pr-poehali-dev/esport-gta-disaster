-- Обновляем пароль админ панели на новый надежный пароль
-- Пароль: DisasterAdmin2024!
-- Хеш bcrypt: $2b$12$kO8vHJ3fZ9qR7tY2xN4LPeQ1wV6mU8oS3pA9nB7cD5eF6gH7iJ8kL

UPDATE admin_passwords 
SET password_hash = '$2b$12$kO8vHJ3fZ9qR7tY2xN4LPeQ1wV6mU8oS3pA9nB7cD5eF6gH7iJ8kL', 
    updated_at = NOW()
WHERE id = (SELECT id FROM admin_passwords ORDER BY id DESC LIMIT 1);