-- Добавляем поля для стиля турнирной сетки и стартовой стадии
ALTER TABLE t_p4831367_esport_gta_disaster.tournaments
ADD COLUMN IF NOT EXISTS bracket_style VARCHAR(50) DEFAULT 'esports',
ADD COLUMN IF NOT EXISTS starting_stage INTEGER DEFAULT 16;

COMMENT ON COLUMN t_p4831367_esport_gta_disaster.tournaments.bracket_style IS 'Стиль турнирной сетки: esports, cyberpunk, minimal, championship, gold-deagle';
COMMENT ON COLUMN t_p4831367_esport_gta_disaster.tournaments.starting_stage IS 'Стартовая стадия турнира: 16, 32, 64, 128 команд';