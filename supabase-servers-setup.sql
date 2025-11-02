CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  is_private BOOLEAN DEFAULT false,
  invite_code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS server_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(server_id, player_id)
);

CREATE TABLE IF NOT EXISTS powerups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  position_x FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 0,
  collected_by UUID REFERENCES players(id) ON DELETE SET NULL,
  collected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 seconds'
);

CREATE INDEX IF NOT EXISTS idx_servers_private ON servers(is_private);
CREATE INDEX IF NOT EXISTS idx_servers_invite_code ON servers(invite_code);
CREATE INDEX IF NOT EXISTS idx_server_players_server ON server_players(server_id);
CREATE INDEX IF NOT EXISTS idx_server_players_player ON server_players(player_id);
CREATE INDEX IF NOT EXISTS idx_powerups_server ON powerups(server_id);
CREATE INDEX IF NOT EXISTS idx_powerups_expires ON powerups(expires_at);

ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE powerups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on servers" ON servers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on servers" ON servers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on server_players" ON server_players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on server_players" ON server_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on powerups" ON powerups FOR SELECT USING (true);
CREATE POLICY "Allow public insert on powerups" ON powerups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on powerups" ON powerups FOR UPDATE USING (true);

