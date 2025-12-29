-- Добавляем поля level и custom_title для пользователей
ALTER TABLE t_p4831367_esport_gta_disaster.users 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS custom_title VARCHAR(50);

-- Устанавливаем максимальный уровень и титул Разработчик для основателя
UPDATE t_p4831367_esport_gta_disaster.users 
SET level = 100, 
    experience = 999999,
    custom_title = 'Разработчик',
    role = 'founder'
WHERE email = 'thugze@bk.ru';