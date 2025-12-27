-- Обновление прав создания тем для ролей
UPDATE t_p4831367_esport_gta_disaster.users 
SET can_create_topics = TRUE 
WHERE role IN ('admin', 'founder', 'authority', 'organizer', 'moderator');

-- Установка автоматических статусов по умолчанию
UPDATE t_p4831367_esport_gta_disaster.users 
SET auto_status = 'Новичок' 
WHERE auto_status IS NULL;

-- Обновление статусов на основе времени
UPDATE t_p4831367_esport_gta_disaster.users 
SET auto_status = CASE 
  WHEN COALESCE(time_on_site, 0) >= 36000 THEN 'Освоившийся'
  WHEN COALESCE(time_on_site, 0) >= 10800 THEN 'Пользователь'
  WHEN COALESCE(time_on_site, 0) >= 3600 THEN 'Пользователь'
  ELSE 'Новичок'
END;
