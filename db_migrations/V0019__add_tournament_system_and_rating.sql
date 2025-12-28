-- Обновляем структуру команд: 5 основных + 2 запасных, рейтинг, уровень
ALTER TABLE teams ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 200;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 2;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 100;

-- Добавляем признак запасного игрока
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS is_substitute BOOLEAN DEFAULT false;

-- Создаем таблицу турниров
CREATE TABLE IF NOT EXISTS tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prize_pool TEXT,
    location TEXT,
    game_project VARCHAR(255),
    map_pool TEXT[],
    format VARCHAR(50) NOT NULL,
    team_size INTEGER NOT NULL DEFAULT 5,
    best_of INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) DEFAULT 'registration',
    registration_open BOOLEAN DEFAULT true,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Создаем таблицу регистраций на турнир
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'pending',
    UNIQUE(tournament_id, team_id)
);

-- Обновляем таблицу матчей: добавляем связь с турниром
ALTER TABLE bracket_matches ADD COLUMN IF NOT EXISTS tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE;
ALTER TABLE bracket_matches ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE bracket_matches ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP;
ALTER TABLE bracket_matches ADD COLUMN IF NOT EXISTS winner_id INTEGER REFERENCES teams(id);

-- Создаем таблицу истории матчей команды для статистики
CREATE TABLE IF NOT EXISTS team_match_history (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    match_id INTEGER REFERENCES bracket_matches(id) ON DELETE CASCADE,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    result VARCHAR(10) NOT NULL,
    rating_change INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем таблицу чата матча
CREATE TABLE IF NOT EXISTS match_chat (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES bracket_matches(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'message',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем таблицу бан-пика карт
CREATE TABLE IF NOT EXISTS match_ban_pick (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES bracket_matches(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    map_name VARCHAR(255) NOT NULL,
    action VARCHAR(10) NOT NULL,
    pick_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_team_match_history_team ON team_match_history(team_id);
CREATE INDEX IF NOT EXISTS idx_match_chat_match ON match_chat(match_id);
CREATE INDEX IF NOT EXISTS idx_match_ban_pick_match ON match_ban_pick(match_id);
