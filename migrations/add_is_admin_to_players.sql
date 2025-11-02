-- Add is_admin column to players table
ALTER TABLE players ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX idx_players_is_admin ON players(is_admin);

-- Create bans table
CREATE TABLE IF NOT EXISTS bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES players(id),
  reason TEXT NOT NULL,
  ban_duration_hours INTEGER NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bans
CREATE INDEX idx_bans_player_id ON bans(player_id);
CREATE INDEX idx_bans_is_active ON bans(is_active);
CREATE INDEX idx_bans_expires_at ON bans(expires_at);

