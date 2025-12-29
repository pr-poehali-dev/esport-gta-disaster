-- Разблокировка аккаунта основателя
UPDATE t_p4831367_esport_gta_disaster.users 
SET is_banned = FALSE, email_verified = TRUE 
WHERE email = 'thugze@bk.ru';