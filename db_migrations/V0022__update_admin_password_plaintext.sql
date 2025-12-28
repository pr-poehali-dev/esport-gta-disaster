-- Обновляем пароль на простой для тестирования
-- Пароль: DisasterAdmin2024!
-- Храним в открытом виде для упрощения (временно)

UPDATE admin_passwords 
SET password_hash = 'DisasterAdmin2024!', 
    updated_at = NOW()
WHERE id = (SELECT MAX(id) FROM admin_passwords);