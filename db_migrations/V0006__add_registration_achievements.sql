-- Добавление достижений за регистрацию и создание команды
INSERT INTO achievements (code, name, description, icon, rarity, category, points) VALUES
    ('first_registration', 'Добро пожаловать!', 'Зарегистрировался на платформе', '👋', 'common', 'registration', 10),
    ('first_tournament', 'Первый турнир', 'Зарегистрировался на первый турнир', '🎮', 'common', 'tournament', 20),
    ('team_captain', 'Капитан команды', 'Создал свою команду', '⚔️', 'rare', 'team', 30)
ON CONFLICT (code) DO NOTHING;

-- Начисление базовых очков (0 очков для новичков)
UPDATE users 
SET achievement_points = 0 
WHERE user_status = 'Новичок' AND achievement_points IS NULL;