UPDATE users SET role = 'admin' WHERE id = 2;

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_organizer BOOLEAN DEFAULT FALSE;

UPDATE users SET is_organizer = TRUE WHERE id = 2;

COMMENT ON COLUMN users.role IS 'User role: player, admin, moderator';
COMMENT ON COLUMN users.is_organizer IS 'Special flag for tournament organizers';
