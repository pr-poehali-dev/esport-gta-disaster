-- Закрыть регистрацию для активных и завершенных турниров
UPDATE t_p4831367_esport_gta_disaster.tournaments 
SET registration_open = false 
WHERE status IN ('active', 'completed') AND registration_open = true;