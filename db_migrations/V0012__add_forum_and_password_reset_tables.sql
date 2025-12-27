-- Таблица для восстановления пароля
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_reset_token ON t_p4831367_esport_gta_disaster.password_reset_tokens(token);
CREATE INDEX idx_password_reset_user ON t_p4831367_esport_gta_disaster.password_reset_tokens(user_id);

-- Таблица тем форума
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.forum_topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author_id INTEGER NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_topics_author ON t_p4831367_esport_gta_disaster.forum_topics(author_id);
CREATE INDEX idx_forum_topics_slug ON t_p4831367_esport_gta_disaster.forum_topics(slug);

-- Таблица постов в темах
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.forum_posts (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    font_family VARCHAR(100) DEFAULT 'Inter',
    images JSONB DEFAULT '[]',
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_posts_topic ON t_p4831367_esport_gta_disaster.forum_posts(topic_id);
CREATE INDEX idx_forum_posts_author ON t_p4831367_esport_gta_disaster.forum_posts(author_id);