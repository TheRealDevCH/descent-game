import { useState, useEffect } from 'react';
import './ServerBrowser.css';

function ServerBrowser({ onServerSelected, onBack }) {
  const [servers, setServers] = useState([]);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinPrivate, setShowJoinPrivate] = useState(false);
  const [serverName, setServerName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/servers');
      const data = await response.json();
      setServers(data.servers || []);
    } catch (error) {
      console.error('Error fetching servers:', error);
    }
  };

  const handleCreateServer = async () => {
    if (!serverName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName,
          isPrivate,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateServer(false);
        setServerName('');
        const serverData = {
          name: serverName,
          isPrivate,
          inviteCode: data.inviteCode,
        };
        onServerSelected(data.serverId, serverData);
      } else {
        setError(data.error || 'Failed to create server');
      }
    } catch (error) {
      console.error('Error creating server:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinServer = (server) => {
    onServerSelected(server.id, server);
  };

  const handleJoinPrivate = async () => {
    if (!inviteCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/servers/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await response.json();
      if (data.success) {
        setShowJoinPrivate(false);
        setInviteCode('');
        const serverData = {
          name: data.serverName,
          isPrivate: true,
          inviteCode: inviteCode,
        };
        onServerSelected(data.serverId, serverData);
      } else {
        setError(data.error || 'Failed to join server');
      }
    } catch (error) {
      console.error('Error joining server:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showCreateServer) {
    return (
      <div className="server-browser">
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Server</h2>
            {error && <div className="error-message">{error}</div>}
            <input
              type="text"
              placeholder="Server Name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="input-field"
              disabled={loading}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={loading}
              />
              Private Server
            </label>
            <div className="modal-buttons">
              <button
                className="button button-play"
                onClick={handleCreateServer}
                disabled={loading || !serverName.trim()}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                className="button button-secondary"
                onClick={() => {
                  setShowCreateServer(false);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showJoinPrivate) {
    return (
      <div className="server-browser">
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Join Private Server</h2>
            {error && <div className="error-message">{error}</div>}
            <input
              type="text"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="input-field"
              disabled={loading}
            />
            <div className="modal-buttons">
              <button
                className="button button-play"
                onClick={handleJoinPrivate}
                disabled={loading || !inviteCode.trim()}
              >
                {loading ? 'Joining...' : 'Join'}
              </button>
              <button
                className="button button-secondary"
                onClick={() => {
                  setShowJoinPrivate(false);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="server-browser">
      <div className="browser-header">
        <h1>Select Server</h1>
        <button className="button button-secondary" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="browser-actions">
        <button
          className="button button-play"
          onClick={() => setShowCreateServer(true)}
        >
          + Create Server
        </button>
        <button
          className="button button-secondary"
          onClick={() => setShowJoinPrivate(true)}
        >
          Join Private
        </button>
      </div>

      <div className="servers-list">
        {servers.length === 0 ? (
          <p className="no-servers">No servers available</p>
        ) : (
          servers.map((server) => (
            <div key={server.id} className="server-item">
              <div className="server-info">
                <div className="server-name-row">
                  <h3>{server.name}</h3>
                  {server.isPrivate && <span className="lock-icon">🔒</span>}
                </div>
                <p>{server.playerCount}/{server.maxPlayers} Players</p>
              </div>
              <button
                className="button button-play"
                onClick={() => handleJoinServer(server)}
              >
                Join
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ServerBrowser;

