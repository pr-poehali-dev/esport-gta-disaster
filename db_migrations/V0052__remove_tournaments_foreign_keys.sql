-- Убираем внешние ключи на tournaments для мягкого удаления
-- Мягкое удаление (removed=1) не требует каскадного удаления

ALTER TABLE t_p4831367_esport_gta_disaster.group_stage_matches 
DROP CONSTRAINT IF EXISTS group_stage_matches_tournament_id_fkey;

ALTER TABLE t_p4831367_esport_gta_disaster.matches 
DROP CONSTRAINT IF EXISTS matches_tournament_id_fkey;

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_brackets 
DROP CONSTRAINT IF EXISTS tournament_brackets_tournament_id_fkey;

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_exclusions 
DROP CONSTRAINT IF EXISTS tournament_exclusions_tournament_id_fkey;

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_registrations 
DROP CONSTRAINT IF EXISTS tournament_registrations_tournament_id_fkey;

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_suspensions 
DROP CONSTRAINT IF EXISTS tournament_suspensions_tournament_id_fkey;