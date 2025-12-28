-- Добавление поля для изображения в таблицу новостей
ALTER TABLE t_p4831367_esport_gta_disaster.news 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE t_p4831367_esport_gta_disaster.news 
ADD COLUMN IF NOT EXISTS tournament_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_news_published 
ON t_p4831367_esport_gta_disaster.news(published, created_at DESC);
