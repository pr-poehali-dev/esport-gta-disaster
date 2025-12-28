ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'upcoming';

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS game VARCHAR(100) DEFAULT 'GTA V';

ALTER TABLE t_p4831367_esport_gta_disaster.tournaments 
ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_tournaments_status 
ON t_p4831367_esport_gta_disaster.tournaments(status);

CREATE INDEX IF NOT EXISTS idx_tournaments_dates 
ON t_p4831367_esport_gta_disaster.tournaments(start_date, end_date);