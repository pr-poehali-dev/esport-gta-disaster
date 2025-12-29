-- Сделать первого пользователя администратором
UPDATE t_p4831367_esport_gta_disaster.users 
SET role = 'admin' 
WHERE id = 3;