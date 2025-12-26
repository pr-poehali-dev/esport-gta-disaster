-- Создание таблицы команд
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    captain_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление индекса для быстрого поиска по капитану
CREATE INDEX IF NOT EXISTS idx_teams_captain ON teams(captain_id);

-- Таблица участников команды
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Индекс для быстрого поиска участников
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Обновление таблицы регистраций на турниры - добавляем team_id
ALTER TABLE tournament_registrations 
ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id);

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_team ON tournament_registrations(team_id);
