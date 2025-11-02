CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  character_skin VARCHAR(50) DEFAULT 'classic',
  purchased_items JSONB DEFAULT '[]'::jsonb,
  highscore INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  position_x FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 5,
  depth INT DEFAULT 0,
  speed FLOAT DEFAULT 1,
  last_update TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS highscores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  depth INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_username ON players(username);
CREATE INDEX IF NOT EXISTS idx_active_players_player_id ON active_players(player_id);
CREATE INDEX IF NOT EXISTS idx_active_players_last_update ON active_players(last_update);
CREATE INDEX IF NOT EXISTS idx_highscores_player_id ON highscores(player_id);
CREATE INDEX IF NOT EXISTS idx_highscores_depth ON highscores(depth DESC);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE highscores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on active_players" ON active_players FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on active_players" ON active_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on active_players" ON active_players FOR UPDATE USING (true);
CREATE POLICY "Allow public read on highscores" ON highscores FOR SELECT USING (true);
CREATE POLICY "Allow public insert on highscores" ON highscores FOR INSERT WITH CHECK (true);

