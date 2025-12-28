-- Таблица глобальных настроек сайта
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.site_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id)
);

-- Вставка дефолтных настроек
INSERT INTO t_p4831367_esport_gta_disaster.site_settings (key, value, description) VALUES
('site_name', 'GTA Disaster Esport', 'Название сайта'),
('site_description', 'Платформа для киберспортивных турниров GTA V', 'Описание сайта'),
('registration_enabled', 'true', 'Включить регистрацию новых пользователей'),
('tournament_creation_enabled', 'true', 'Разрешить создание турниров'),
('maintenance_mode', 'false', 'Режим технического обслуживания'),
('max_team_size', '5', 'Максимальный размер команды'),
('default_tournament_format', '5v5', 'Формат турнира по умолчанию')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_site_settings_key ON t_p4831367_esport_gta_disaster.site_settings(key);
