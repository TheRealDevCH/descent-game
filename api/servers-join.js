import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code required' });
    }

    const { data: server, error } = await supabase
      .from('servers')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (error || !server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    const { count } = await supabase
      .from('server_players')
      .select('*', { count: 'exact', head: true })
      .eq('server_id', server.id);

    if (count >= 50) {
      return res.status(400).json({ error: 'Server is full' });
    }

    return res.status(200).json({
      success: true,
      serverId: server.id,
      serverName: server.name,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

