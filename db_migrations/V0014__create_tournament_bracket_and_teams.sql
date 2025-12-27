-- Таблица команд
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    website VARCHAR(255),
    captain_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица участников команды
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    user_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id),
    role VARCHAR(20) DEFAULT 'player',
    is_reserve BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Таблица турнирных сеток
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.tournament_brackets (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.tournaments(id),
    format VARCHAR(50) NOT NULL,
    created_by INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица матчей в турнирной сетке
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.bracket_matches (
    id SERIAL PRIMARY KEY,
    bracket_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.tournament_brackets(id),
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    team2_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    winner_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.teams(id),
    score_team1 INTEGER DEFAULT 0,
    score_team2 INTEGER DEFAULT 0,
    map_name VARCHAR(100),
    scheduled_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_team_members_team ON t_p4831367_esport_gta_disaster.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON t_p4831367_esport_gta_disaster.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_bracket_matches_bracket ON t_p4831367_esport_gta_disaster.bracket_matches(bracket_id);
CREATE INDEX IF NOT EXISTS idx_bracket_matches_teams ON t_p4831367_esport_gta_disaster.bracket_matches(team1_id, team2_id);
