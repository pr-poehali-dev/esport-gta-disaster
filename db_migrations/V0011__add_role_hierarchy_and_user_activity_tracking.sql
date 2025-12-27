-- Добавляем новые поля в таблицу users для системы ролей и активности
ALTER TABLE t_p4831367_esport_gta_disaster.users 
ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_status VARCHAR(50) DEFAULT 'Новичок',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS signature_url TEXT,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT NOW();

-- Обновляем существующие роли с новой иерархией
UPDATE t_p4831367_esport_gta_disaster.users 
SET auto_status = 'Новичок' 
WHERE auto_status IS NULL;

-- Создаем таблицу для отслеживания сессий активности пользователей
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.user_activity_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Создаем индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_activity_sessions_user_id 
ON t_p4831367_esport_gta_disaster.user_activity_sessions(user_id);

-- Создаем таблицу для управления правами доступа ролей (RBAC)
CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.role_permissions (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    permissions JSONB DEFAULT '{}',
    hierarchy_level INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Заполняем таблицу ролей с иерархией (чем меньше число, тем выше роль)
INSERT INTO t_p4831367_esport_gta_disaster.role_permissions (role_name, hierarchy_level, permissions) 
VALUES 
    ('founder', 1, '{"can_manage_all": true, "can_change_roles": true, "can_edit_permissions": true}'),
    ('director', 2, '{"can_manage_admins": true, "can_manage_content": true, "can_manage_users": true}'),
    ('admin', 3, '{"can_moderate": true, "can_manage_content": true, "can_ban_users": true, "can_create_discussions": true}'),
    ('moderator', 4, '{"can_moderate_content": true, "can_warn_users": true, "can_create_discussions": true}'),
    ('chief_judge', 5, '{"can_post_priority_content": true, "can_upload_mods": true}'),
    ('legend', 6, '{"can_view_match_stats": true}'),
    ('authority', 7, '{"can_create_discussions": true, "has_badge": true}')
ON CONFLICT (role_name) DO NOTHING;

-- Комментарии к таблицам
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.users.total_time_seconds IS 'Общее время активности пользователя в секундах';
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.users.auto_status IS 'Автоматический статус: Новичок, Пользователь, Освоившийся, Киберспортсмен';
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.users.bio IS 'Биография/описание пользователя';
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.users.signature_url IS 'URL изображения или видео для подписи профиля';
COMMENT ON TABLE t_p4831367_esport_gta_disaster.user_activity_sessions IS 'Сессии активности пользователей для автоматического обновления статусов';
COMMENT ON TABLE t_p4831367_esport_gta_disaster.role_permissions IS 'Управление правами доступа для системы RBAC';