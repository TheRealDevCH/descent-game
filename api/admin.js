import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_PASSWORD = '270696';

export default async function handler(req, res) {
  // Check password for all admin operations
  const { password, action } = req.body;

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized - Invalid password' });
  }

  try {
    if (action === 'getServers') {
      const { data: servers, error } = await supabase
        .from('servers')
        .select('*, server_players(count)');

      if (error) throw error;

      // Add player count to each server
      const serversWithCount = servers.map(server => ({
        ...server,
        playerCount: server.server_players?.[0]?.count || 0
      }));

      return res.status(200).json({ servers: serversWithCount });
    }

    if (action === 'deleteServer') {
      const { serverId } = req.body;

      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      // Delete server_players first (foreign key constraint)
      await supabase
        .from('server_players')
        .delete()
        .eq('server_id', serverId);

      // Delete server
      const { error } = await supabase
        .from('servers')
        .delete()
        .eq('id', serverId);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Server deleted' });
    }

    if (action === 'getPlayers') {
      const { data: players, error } = await supabase
        .from('players')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ players });
    }

    if (action === 'createPlayer') {
      const { username, characterSkin = 'classic' } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username required' });
      }

      const { data: player, error } = await supabase
        .from('players')
        .insert([
          {
            username,
            character_skin: characterSkin,
            highscore: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, player });
    }

    if (action === 'deletePlayer') {
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({ error: 'Player ID required' });
      }

      // Delete player from server_players first
      await supabase
        .from('server_players')
        .delete()
        .eq('player_id', playerId);

      // Delete active_players
      await supabase
        .from('active_players')
        .delete()
        .eq('player_id', playerId);

      // Delete player
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Player deleted' });
    }

    if (action === 'getServerPlayers') {
      const { serverId } = req.body;

      if (!serverId) {
        return res.status(400).json({ error: 'Server ID required' });
      }

      const { data: players, error } = await supabase
        .from('server_players')
        .select('*, players(username, character_skin)')
        .eq('server_id', serverId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ players });
    }

    if (action === 'removePlayerFromServer') {
      const { serverId, playerId } = req.body;

      if (!serverId || !playerId) {
        return res.status(400).json({ error: 'Server ID and Player ID required' });
      }

      const { error } = await supabase
        .from('server_players')
        .delete()
        .eq('server_id', serverId)
        .eq('player_id', playerId);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Player removed from server' });
    }

    if (action === 'createServer') {
      const { name, isPrivate = false } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Server name required' });
      }

      const generateInviteCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };

      const inviteCode = generateInviteCode();

      const { data: server, error } = await supabase
        .from('servers')
        .insert([
          {
            name,
            is_private: isPrivate,
            invite_code: inviteCode,
            created_at: new Date()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, server });
    }

    if (action === 'markPlayerAsAdmin') {
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({ error: 'Player ID required' });
      }

      const { error } = await supabase
        .from('players')
        .update({ is_admin: true })
        .eq('id', playerId);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Player marked as admin' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

