-- Добавляем колонку для скрытия турниров
ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- Индекс для быстрой фильтрации видимых турниров
CREATE INDEX IF NOT EXISTS idx_tournaments_is_hidden 
ON t_p4831367_esport_gta_disaster.tournaments(is_hidden);