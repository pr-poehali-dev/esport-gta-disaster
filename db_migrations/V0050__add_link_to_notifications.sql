-- Добавление поля link в таблицу notifications
ALTER TABLE t_p4831367_esport_gta_disaster.notifications 
ADD COLUMN IF NOT EXISTS link TEXT;