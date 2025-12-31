-- Добавляем поле removed для мягкого удаления турниров
ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS removed SMALLINT DEFAULT 0;

-- Создаем индекс для быстрой фильтрации
CREATE INDEX IF NOT EXISTS idx_tournaments_removed 
ON t_p4831367_esport_gta_disaster.tournaments(removed);