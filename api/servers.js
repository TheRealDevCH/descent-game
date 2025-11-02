import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get ALL servers (both public and private)
      const { data: servers, error } = await supabase
        .from('servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const serversWithPlayerCount = await Promise.all(
        servers.map(async (server) => {
          const { count } = await supabase
            .from('server_players')
            .select('*', { count: 'exact', head: true })
            .eq('server_id', server.id);

          return {
            id: server.id,
            name: server.name,
            playerCount: count || 0,
            maxPlayers: 50,
            isPrivate: server.is_private,
            inviteCode: server.invite_code,
          };
        })
      );

      return res.status(200).json({ servers: serversWithPlayerCount });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, isPrivate } = req.body;
      const inviteCode = generateInviteCode();

      const { data: server, error } = await supabase
        .from('servers')
        .insert([
          {
            name,
            is_private: isPrivate,
            invite_code: inviteCode,
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        serverId: server.id,
        inviteCode: inviteCode,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

