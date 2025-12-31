-- Создание таблицы для матчей групповой стадии
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.group_stage_matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES t_p4831367_esport_gta_disaster.tournaments(id),
    group_name VARCHAR(1) NOT NULL CHECK (group_name IN ('A', 'B', 'C', 'D')),
    team1_id INTEGER NOT NULL REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    team2_id INTEGER NOT NULL REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    team1_score INTEGER DEFAULT 0,
    team2_score INTEGER DEFAULT 0,
    played BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_matches_tournament ON t_p4831367_esport_gta_disaster.group_stage_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_group_matches_group ON t_p4831367_esport_gta_disaster.group_stage_matches(group_name);