-- Обновить существующие регистрации с tournament_id
UPDATE t_p4831367_esport_gta_disaster.tournament_registrations 
SET tournament_id = 1, 
    approved = TRUE,
    status = 'confirmed'
WHERE tournament_id IS NULL;