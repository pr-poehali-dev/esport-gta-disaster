-- Добавляем поля для модерации в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_muted BOOLEAN DEFAULT FALSE;

-- Создаем таблицу банов
CREATE TABLE IF NOT EXISTS bans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    admin_id INTEGER NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    ban_start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    ban_end_date TIMESTAMP,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Создаем таблицу мутов
CREATE TABLE IF NOT EXISTS mutes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    admin_id INTEGER NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    mute_start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    mute_end_date TIMESTAMP,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Создаем таблицу отстранений от турниров
CREATE TABLE IF NOT EXISTS tournament_exclusions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    tournament_id INTEGER REFERENCES tournaments(id),
    admin_id INTEGER NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    exclusion_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем таблицу логов действий администраторов
CREATE TABLE IF NOT EXISTS admin_actions_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_user_id INTEGER REFERENCES users(id),
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем таблицу для кодов подтверждения email
CREATE TABLE IF NOT EXISTS admin_verification_codes (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    code VARCHAR(6) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_data TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_bans_user_id ON bans(user_id);
CREATE INDEX IF NOT EXISTS idx_mutes_user_id ON mutes(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_exclusions_user_id ON tournament_exclusions(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_exclusions_tournament_id ON tournament_exclusions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_log_admin_id ON admin_actions_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_verification_codes_admin_id ON admin_verification_codes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_verification_codes_code ON admin_verification_codes(code);
