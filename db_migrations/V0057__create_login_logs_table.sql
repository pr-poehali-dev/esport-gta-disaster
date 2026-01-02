-- Создание таблицы для расширенного логирования авторизаций
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    login_successful BOOLEAN NOT NULL DEFAULT TRUE,
    login_method VARCHAR(50) DEFAULT 'password',
    session_id INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON t_p4831367_esport_gta_disaster.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON t_p4831367_esport_gta_disaster.login_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip ON t_p4831367_esport_gta_disaster.login_logs(ip_address);