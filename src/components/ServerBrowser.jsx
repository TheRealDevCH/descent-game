import { useState, useEffect } from 'react';
import './ServerBrowser.css';

function ServerBrowser({ onJoin, onBack }) {
  const [servers, setServers] = useState([]);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showJoinPrivate, setShowJoinPrivate] = useState(false);
  const [serverName, setServerName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

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
        onJoin(data.serverId, data.inviteCode);
      }
    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  const handleJoinServer = (serverId) => {
    onJoin(serverId, null);
  };

  const handleJoinPrivate = async () => {
    if (!inviteCode.trim()) return;

    try {
      const response = await fetch('/api/servers/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });

      const data = await response.json();
      if (data.success) {
        onJoin(data.serverId, null);
      }
    } catch (error) {
      console.error('Error joining server:', error);
    }
  };

  if (showCreateServer) {
    return (
      <div className="server-browser">
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create Server</h2>
            <input
              type="text"
              placeholder="Server Name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="input-field"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              Private Server
            </label>
            <div className="modal-buttons">
              <button
                className="button button-play"
                onClick={handleCreateServer}
              >
                Create
              </button>
              <button
                className="button button-secondary"
                onClick={() => setShowCreateServer(false)}
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
            <input
              type="text"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="input-field"
            />
            <div className="modal-buttons">
              <button
                className="button button-play"
                onClick={handleJoinPrivate}
              >
                Join
              </button>
              <button
                className="button button-secondary"
                onClick={() => setShowJoinPrivate(false)}
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
                <h3>{server.name}</h3>
                <p>{server.playerCount}/{server.maxPlayers} Players</p>
              </div>
              <button
                className="button button-play"
                onClick={() => handleJoinServer(server.id)}
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

