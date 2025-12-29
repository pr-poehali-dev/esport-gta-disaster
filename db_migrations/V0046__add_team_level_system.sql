-- Добавление системы уровней для команд
ALTER TABLE t_p4831367_esport_gta_disaster.teams 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 200;

-- Установка начальных значений для существующих команд
UPDATE t_p4831367_esport_gta_disaster.teams 
SET level = 2, points = 200 
WHERE level IS NULL OR points IS NULL;