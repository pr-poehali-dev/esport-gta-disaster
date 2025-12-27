-- Добавление полей для команд: тег, верификация, статистика
ALTER TABLE teams 
ADD COLUMN tag VARCHAR(10),
ADD COLUMN verified BOOLEAN DEFAULT FALSE,
ADD COLUMN wins INTEGER DEFAULT 0,
ADD COLUMN losses INTEGER DEFAULT 0,
ADD COLUMN description TEXT;

-- Добавление уникального индекса для тега команды
CREATE UNIQUE INDEX idx_teams_tag ON teams(tag) WHERE tag IS NOT NULL;

-- Комментарии к новым полям
COMMENT ON COLUMN teams.tag IS 'Короткий тег команды (например, PHNTM, VRTX)';
COMMENT ON COLUMN teams.verified IS 'Статус верификации команды (показывается на сайте только verified=true)';
COMMENT ON COLUMN teams.wins IS 'Количество побед команды';
COMMENT ON COLUMN teams.losses IS 'Количество поражений команды';
COMMENT ON COLUMN teams.description IS 'Описание команды';