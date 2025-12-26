-- Добавляем поля для подтверждения email
ALTER TABLE t_p4831367_esport_gta_disaster.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_expires_at TIMESTAMP;

-- Создаем таблицу турниров
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    max_teams INTEGER DEFAULT 16,
    registration_open BOOLEAN DEFAULT TRUE,
    game_type VARCHAR(100),
    prize_pool VARCHAR(255),
    rules TEXT,
    created_by INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обновляем таблицу tournament_registrations
ALTER TABLE t_p4831367_esport_gta_disaster.tournament_registrations
ADD COLUMN IF NOT EXISTS tournament_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.tournaments(id),
ADD COLUMN IF NOT EXISTS discord_contact VARCHAR(255),
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON t_p4831367_esport_gta_disaster.users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON t_p4831367_esport_gta_disaster.users(verification_token);
CREATE INDEX IF NOT EXISTS idx_tournaments_registration_open ON t_p4831367_esport_gta_disaster.tournaments(registration_open);
CREATE INDEX IF NOT EXISTS idx_tournament_registrations_tournament_id ON t_p4831367_esport_gta_disaster.tournament_registrations(tournament_id);

-- Устанавливаем всем существующим пользователям email_verified = TRUE
UPDATE t_p4831367_esport_gta_disaster.users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;

-- Создаем дефолтный турнир
INSERT INTO t_p4831367_esport_gta_disaster.tournaments (name, description, start_date, registration_open, game_type, prize_pool)
VALUES (
    'Winter Championship 2025',
    'Зимний чемпионат по ГТА Криминальная Россия',
    '2025-01-15 18:00:00',
    TRUE,
    'GTA Criminal Russia',
    '100,000 RUB'
) ON CONFLICT (name) DO NOTHING;
