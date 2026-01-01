-- Добавление столбцов для хранения результатов, отправленных капитанами команд
ALTER TABLE t_p4831367_esport_gta_disaster.bracket_matches
ADD COLUMN IF NOT EXISTS team1_reported_score INTEGER,
ADD COLUMN IF NOT EXISTS team2_reported_score INTEGER;