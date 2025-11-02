-- Add is_admin column to players table
ALTER TABLE players ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX idx_players_is_admin ON players(is_admin);

