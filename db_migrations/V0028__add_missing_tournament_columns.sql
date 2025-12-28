ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS game_project VARCHAR(100);

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS map_pool TEXT;

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS format VARCHAR(50);

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS team_size INTEGER;

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS best_of INTEGER;