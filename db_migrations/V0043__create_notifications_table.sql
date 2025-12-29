-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON t_p4831367_esport_gta_disaster.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON t_p4831367_esport_gta_disaster.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON t_p4831367_esport_gta_disaster.notifications(created_at DESC);