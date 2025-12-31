-- Добавляем поле style для хранения визуального стиля турнирной сетки

ALTER TABLE t_p4831367_esport_gta_disaster.tournament_brackets
ADD COLUMN style VARCHAR(50) DEFAULT 'esports';