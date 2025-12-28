-- Создание таблицы email уведомлений для пользователей
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    notification_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    is_sent BOOLEAN DEFAULT FALSE,
    error_message TEXT
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_sent ON user_notifications(is_sent);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(notification_type);