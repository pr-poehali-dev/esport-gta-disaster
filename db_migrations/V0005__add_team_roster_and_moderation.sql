-- Добавление уникального индекса на nickname
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nickname_unique ON users(LOWER(nickname));

-- Обновление таблицы team_members для состава команды
ALTER TABLE team_members 
ADD COLUMN IF NOT EXISTS player_role VARCHAR(20) DEFAULT 'main',
ADD COLUMN IF NOT EXISTS player_nickname VARCHAR(100);

-- Создание уникального индекса для nickname в команде
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_nickname_unique 
ON team_members(team_id, LOWER(player_nickname)) 
WHERE player_nickname IS NOT NULL;

-- player_role может быть: 'main' (5 игроков) или 'reserve' (2 игрока)

-- Обновление таблицы регистраций для модерации
ALTER TABLE tournament_registrations 
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_comment TEXT,
ADD COLUMN IF NOT EXISTS moderated_by INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

-- moderation_status может быть: 'pending', 'approved', 'rejected'

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_moderation 
ON tournament_registrations(moderation_status);

CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament 
ON tournament_registrations(tournament_name);
