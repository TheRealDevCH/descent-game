import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const profanityList = [
  'badword1', 'badword2', 'badword3', 'fuck', 'shit', 'ass', 'bitch',
  'damn', 'crap', 'piss', 'dick', 'pussy', 'cock', 'whore', 'slut'
];

function isProfane(text) {
  const lower = text.toLowerCase();
  return profanityList.some(word => lower.includes(word));
}

function sanitizeUsername(username) {
  return username.trim().substring(0, 50);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, username, playerId, positionX, positionZ, depth, speed, characterSkin, purchasedItems } = req.body;

  try {
    if (action === 'createPlayer') {
      if (!username || username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }

      if (isProfane(username)) {
        return res.status(400).json({ error: 'Username contains inappropriate content' });
      }

      const sanitized = sanitizeUsername(username);

      const { data, error } = await supabase
        .from('players')
        .insert([{
          username: sanitized,
          character_skin: characterSkin || 'classic',
          purchased_items: purchasedItems || [],
          highscore: 0
        }])
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ player: data[0] });
    }

    if (action === 'updatePosition') {
      const { data, error } = await supabase
        .from('active_players')
        .upsert({
          player_id: playerId,
          position_x: positionX,
          position_z: positionZ,
          depth: depth,
          speed: speed,
          last_update: new Date().toISOString()
        }, { onConflict: 'player_id' })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    if (action === 'joinServer') {
      const { playerId, serverId } = req.body;

      if (!playerId || !serverId) {
        return res.status(400).json({ error: 'Player ID and Server ID required' });
      }

      const { data, error } = await supabase
        .from('server_players')
        .upsert({
          server_id: serverId,
          player_id: playerId,
          joined_at: new Date().toISOString()
        }, { onConflict: 'server_id,player_id' })
        .select();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    if (action === 'getActivePlayers') {
      const { serverId } = req.body;

      let query = supabase
        .from('active_players')
        .select('*, players(username, character_skin)')
        .gt('last_update', new Date(Date.now() - 5000).toISOString());

      // If serverId is provided, only get players from that server
      if (serverId) {
        query = query.in('player_id',
          supabase
            .from('server_players')
            .select('player_id')
            .eq('server_id', serverId)
        );
      }

      const { data, error } = await query;

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ players: data });
    }

    if (action === 'updateHighscore') {
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('highscore')
        .eq('id', playerId)
        .single();

      if (playerError) {
        return res.status(400).json({ error: playerError.message });
      }

      if (depth > player.highscore) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ highscore: depth })
          .eq('id', playerId);

        if (updateError) {
          return res.status(400).json({ error: updateError.message });
        }

        await supabase
          .from('highscores')
          .insert([{ player_id: playerId, depth: depth }]);
      }

      return res.status(200).json({ success: true });
    }

    if (action === 'getLeaderboard') {
      const { data, error } = await supabase
        .from('players')
        .select('username, highscore, character_skin')
        .order('highscore', { ascending: false })
        .limit(10);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ leaderboard: data });
    }

    if (action === 'removePlayer') {
      const { error } = await supabase
        .from('active_players')
        .delete()
        .eq('player_id', playerId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

