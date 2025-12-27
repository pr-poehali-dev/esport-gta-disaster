-- Добавляем колонку referee_id в bracket_matches
ALTER TABLE t_p4831367_esport_gta_disaster.bracket_matches 
ADD COLUMN IF NOT EXISTS referee_id INTEGER REFERENCES t_p4831367_esport_gta_disaster.users(id);

-- Добавляем колонку team_color для команд
ALTER TABLE t_p4831367_esport_gta_disaster.teams
ADD COLUMN IF NOT EXISTS team_color VARCHAR(7) DEFAULT '#0D94E7';

-- Индекс для быстрого поиска матчей судьи
CREATE INDEX IF NOT EXISTS idx_bracket_matches_referee ON t_p4831367_esport_gta_disaster.bracket_matches(referee_id);

-- Комментарии
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.bracket_matches.referee_id IS 'Судья, назначенный на матч';
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.teams.team_color IS 'Цвет команды в hex формате';