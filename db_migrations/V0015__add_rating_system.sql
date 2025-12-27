-- Добавляем рейтинг командам
ALTER TABLE t_p4831367_esport_gta_disaster.teams 
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0;

-- Добавляем рейтинг пользователям
ALTER TABLE t_p4831367_esport_gta_disaster.users 
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS losses INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mvp_count INTEGER DEFAULT 0;

-- Создаем индексы для сортировки по рейтингу
CREATE INDEX IF NOT EXISTS idx_teams_rating ON t_p4831367_esport_gta_disaster.teams(rating DESC);
CREATE INDEX IF NOT EXISTS idx_users_rating ON t_p4831367_esport_gta_disaster.users(rating DESC);
