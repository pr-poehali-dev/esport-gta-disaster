-- Добавление полей для управления турниром
ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 16;

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS is_started BOOLEAN DEFAULT FALSE;

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_registrations 
ADD COLUMN IF NOT EXISTS main_players JSONB DEFAULT '[]'::jsonb;

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_registrations 
ADD COLUMN IF NOT EXISTS reserve_players JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_tournaments_visibility 
ON t_p4831367_esport_gta_disaster.tournaments(is_hidden, deleted_at) 
WHERE deleted_at IS NULL;
