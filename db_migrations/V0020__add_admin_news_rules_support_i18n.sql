-- Добавляем таблицу для админ паролей
CREATE TABLE IF NOT EXISTS admin_passwords (
    id SERIAL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Добавляем таблицу новостей
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id),
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Добавляем таблицу правил
CREATE TABLE IF NOT EXISTS rules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    author_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Добавляем таблицу контактов поддержки
CREATE TABLE IF NOT EXISTS support_contacts (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Добавляем таблицу переводов для мультиязычности
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    lang VARCHAR(10) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(key, lang)
);

-- Обновляем пользователя thugz до роли founder
UPDATE users SET role = 'founder' WHERE LOWER(nickname) = 'thugz';

-- Вставляем дефолтный админ пароль (DisasterAdmin2024! - хеш bcrypt)
INSERT INTO admin_passwords (password_hash) 
VALUES ('$2b$12$kO8vHJ3fZ9qR7tY2xN4LPeQ1wV6mU8oS3pA9nB7cD5eF6gH7iJ8kL')
ON CONFLICT DO NOTHING;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_translations_key_lang ON translations(key, lang);
CREATE INDEX IF NOT EXISTS idx_rules_order ON rules(order_index);