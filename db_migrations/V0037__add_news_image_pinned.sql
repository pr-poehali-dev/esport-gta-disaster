-- Добавление полей image_url и pinned в таблицу news
ALTER TABLE t_p4831367_esport_gta_disaster.news 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;