-- Верифицировать все существующие команды
UPDATE t_p4831367_esport_gta_disaster.teams 
SET verified = TRUE 
WHERE verified = FALSE;