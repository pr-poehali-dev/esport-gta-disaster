CREATE TABLE IF NOT EXISTS t_p4831367_esport_gta_disaster.team_invitations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    inviter_id INTEGER NOT NULL,
    invited_user_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    player_role VARCHAR(50) DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    UNIQUE(team_id, invited_user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_invitations_invited 
ON t_p4831367_esport_gta_disaster.team_invitations(invited_user_id, status);

CREATE INDEX IF NOT EXISTS idx_team_invitations_team 
ON t_p4831367_esport_gta_disaster.team_invitations(team_id, status);

ALTER TABLE t_p4831367_esport_gta_disaster.team_members 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

ALTER TABLE t_p4831367_esport_gta_disaster.team_members 
ADD COLUMN IF NOT EXISTS is_captain BOOLEAN DEFAULT FALSE;