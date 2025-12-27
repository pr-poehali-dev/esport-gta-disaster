-- Добавляем настройки приватности профиля
ALTER TABLE t_p4831367_esport_gta_disaster.users 
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_discord BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_team BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_rating BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS custom_status VARCHAR(200);

-- Добавляем поля для истории матчей
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.match_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id),
    team_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    match_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.bracket_matches(id),
    result VARCHAR(10),
    mvp BOOLEAN DEFAULT FALSE,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    played_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_history_user ON t_p4831367_esport_gta_disaster.match_history(user_id);
CREATE INDEX IF NOT EXISTS idx_match_history_team ON t_p4831367_esport_gta_disaster.match_history(team_id);
