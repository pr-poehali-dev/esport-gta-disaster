-- Добавляем команды на турнир напрямую
INSERT INTO t_p4831367_esport_gta_disaster.tournament_registrations 
(user_id, tournament_name, status, registered_at, team_id, tournament_id, approved)
VALUES
(3, 'WIN CUP 2025', 'confirmed', NOW(), 3, 1, TRUE),
(3, 'WIN CUP 2025', 'confirmed', NOW(), 6, 1, TRUE)
ON CONFLICT DO NOTHING;