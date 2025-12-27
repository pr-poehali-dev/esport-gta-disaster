-- Расширяем таблицу bracket_matches для подробной информации
ALTER TABLE t_p4831367_esport_gta_disaster.bracket_matches 
ADD COLUMN IF NOT EXISTS team1_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS team2_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS match_details TEXT,
ADD COLUMN IF NOT EXISTS team1_captain_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS team2_captain_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS moderator_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Создаем таблицу для скриншотов матчей
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.match_screenshots (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.bracket_matches(id),
    team_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    uploaded_by INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id),
    screenshot_url TEXT NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_match_screenshots_match_id ON t_p4831367_esport_gta_disaster.match_screenshots(match_id);
CREATE INDEX IF NOT EXISTS idx_match_screenshots_team_id ON t_p4831367_esport_gta_disaster.match_screenshots(team_id);

-- Комментарии
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.bracket_matches.status IS 'pending, in_progress, completed, disputed';
COMMENT ON TABLE t_p4831367_esport_gta_disaster.match_screenshots IS 'Скриншоты матчей, загружаемые капитанами команд';