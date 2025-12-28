ALTER TABLE t_p4831367_esport_gta_disaster.tournament_registrations 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_registrations 
ADD COLUMN IF NOT EXISTS seed_position INTEGER;

CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.bracket_stages (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL,
    stage_name VARCHAR(100),
    stage_order INTEGER,
    best_of INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE t_p4831367_esport_gta_disaster.matches 
ADD COLUMN IF NOT EXISTS stage_id INTEGER;

ALTER TABLE t_p4831367_esport_gta_disaster.matches 
ADD COLUMN IF NOT EXISTS match_number INTEGER;

ALTER TABLE t_p4831367_esport_gta_disaster.matches 
ADD COLUMN IF NOT EXISTS next_match_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_matches_tournament_stage 
ON t_p4831367_esport_gta_disaster.matches(tournament_id, stage_id);

CREATE INDEX IF NOT EXISTS idx_bracket_stages_tournament 
ON t_p4831367_esport_gta_disaster.bracket_stages(tournament_id, stage_order);