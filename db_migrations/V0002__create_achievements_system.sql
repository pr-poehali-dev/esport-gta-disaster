CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    achievement_id INTEGER NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER DEFAULT 100,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX idx_achievements_code ON achievements(code);
CREATE INDEX idx_achievements_category ON achievements(category);

INSERT INTO achievements (code, name, description, icon, rarity, category, points) VALUES
('first_blood', 'Первая кровь', 'Одержи свою первую победу в турнире', '⚔️', 'common', 'wins', 10),
('win_streak_5', 'Неудержимый', 'Одержи 5 побед подряд', '🔥', 'rare', 'wins', 50),
('win_streak_10', 'Легенда', 'Одержи 10 побед подряд', '⚡', 'epic', 'wins', 100),
('season_champion', 'Чемпион сезона', 'Стань победителем турнира сезона', '🏆', 'legendary', 'tournament', 500),
('perfect_game', 'Безупречная игра', 'Выиграй матч со счетом 3:0', '💎', 'rare', 'wins', 30),
('comeback_king', 'Король камбэков', 'Выиграй матч, проигрывая 0:2', '👑', 'epic', 'wins', 75),
('tournament_veteran', 'Ветеран турниров', 'Участвуй в 10 турнирах', '🎖️', 'rare', 'participation', 40),
('rising_star', 'Восходящая звезда', 'Войди в топ-10 рейтинга', '⭐', 'epic', 'rating', 80),
('top_3', 'Призер турнира', 'Займи место в топ-3 турнира', '🥉', 'rare', 'tournament', 60),
('clutch_master', 'Мастер клатчей', 'Выиграй 3 решающих раунда подряд', '💪', 'epic', 'wins', 70),
('first_tournament', 'Первый турнир', 'Зарегистрируйся на свой первый турнир', '🎮', 'common', 'participation', 5),
('team_player', 'Командный игрок', 'Сыграй 5 командных матчей', '🤝', 'common', 'participation', 15),
('sharpshooter', 'Снайпер', 'Набери 50+ убийств в одном матче', '🎯', 'rare', 'performance', 45),
('speed_demon', 'Демон скорости', 'Выиграй матч за 5 минут или меньше', '💨', 'epic', 'performance', 65),
('undefeated', 'Непобедимый', 'Выиграй турнир без единого поражения', '🛡️', 'legendary', 'tournament', 300);