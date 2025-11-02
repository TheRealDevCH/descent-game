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
        .select('*');

      if (error) throw error;

      // Get player count for each server
      const serversWithCount = await Promise.all(
        servers.map(async (server) => {
          const { count } = await supabase
            .from('server_players')
            .select('*', { count: 'exact', head: true })
            .eq('server_id', server.id);

          return {
            ...server,
            playerCount: count || 0
          };
        })
      );

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

    if (action === 'banPlayer') {
      const { playerId, reason, durationHours, adminId } = req.body;

      if (!playerId || !reason || !durationHours) {
        return res.status(400).json({ error: 'Player ID, reason, and duration required' });
      }

      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

      const { data: ban, error } = await supabase
        .from('bans')
        .insert([
          {
            player_id: playerId,
            banned_by: adminId,
            reason,
            ban_duration_hours: durationHours,
            expires_at: expiresAt.toISOString(),
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, ban });
    }

    if (action === 'getBans') {
      const { data: bans, error } = await supabase
        .from('bans')
        .select('*, players(username)')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ bans });
    }

    if (action === 'unbanPlayer') {
      const { banId } = req.body;

      if (!banId) {
        return res.status(400).json({ error: 'Ban ID required' });
      }

      const { error } = await supabase
        .from('bans')
        .update({ is_active: false })
        .eq('id', banId);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Player unbanned' });
    }

    if (action === 'checkBan') {
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({ error: 'Player ID required' });
      }

      const { data: ban, error } = await supabase
        .from('bans')
        .select('*')
        .eq('player_id', playerId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (ban) {
        return res.status(200).json({ isBanned: true, ban });
      }

      return res.status(200).json({ isBanned: false });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

