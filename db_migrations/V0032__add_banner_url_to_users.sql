-- Добавление поля для баннера в профиле пользователя
ALTER TABLE t_p4831367_esport_gta_disaster.users 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

CREATE INDEX IF NOT EXISTS idx_users_banner 
ON t_p4831367_esport_gta_disaster.users(banner_url) 
WHERE banner_url IS NOT NULL;