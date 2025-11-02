import { useState, useEffect } from 'react';
import './AdminPanel.css';

function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('servers');
  const [servers, setServers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newServerName, setNewServerName] = useState('');
  const [newPlayerUsername, setNewPlayerUsername] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '270696') {
      setIsAuthenticated(true);
      setError(null);
      fetchServers();
      fetchPlayers();
    } else {
      setError('Invalid password');
    }
  };

  const fetchServers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: '270696',
          action: 'getServers'
        })
      });
      const data = await response.json();
      if (data.servers) setServers(data.servers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: '270696',
          action: 'getPlayers'
        })
      });
      const data = await response.json();
      if (data.players) setPlayers(data.players);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteServer = async (serverId) => {
    if (!window.confirm('Are you sure you want to delete this server?')) return;
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: '270696',
          action: 'deleteServer',
          serverId
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchServers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePlayer = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: '270696',
          action: 'deletePlayer',
          playerId
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchPlayers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const createServer = async (e) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: '270696',
          action: 'createServer',
          name: newServerName,
          isPrivate: false
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewServerName('');
        fetchServers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const createPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerUsername.trim()) return;

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: '270696',
          action: 'createPlayer',
          username: newPlayerUsername,
          characterSkin: 'classic'
        })
      });
      const data = await response.json();
      if (data.success) {
        setNewPlayerUsername('');
        fetchPlayers();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h1>🔐 Admin Panel</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
            />
            <button type="submit" className="login-button">Login</button>
          </form>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Admin Control Panel</h1>
        <button onClick={() => setIsAuthenticated(false)} className="logout-button">Logout</button>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'servers' ? 'active' : ''}`}
          onClick={() => setActiveTab('servers')}
        >
          Servers
        </button>
        <button
          className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'servers' && (
        <div className="admin-content">
          <div className="create-section">
            <h2>Create New Server</h2>
            <form onSubmit={createServer}>
              <input
                type="text"
                placeholder="Server Name"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
              />
              <button type="submit">Create Server</button>
            </form>
          </div>

          <div className="list-section">
            <h2>Servers ({servers.length})</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="admin-list">
                {servers.map(server => (
                  <div key={server.id} className="admin-item">
                    <div className="item-info">
                      <h3>{server.name}</h3>
                      <p>Players: {server.playerCount}/50</p>
                      <p>ID: {server.id}</p>
                      {server.is_private && <p>🔒 Private</p>}
                    </div>
                    <button
                      onClick={() => deleteServer(server.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="admin-content">
          <div className="create-section">
            <h2>Create New Player</h2>
            <form onSubmit={createPlayer}>
              <input
                type="text"
                placeholder="Player Username"
                value={newPlayerUsername}
                onChange={(e) => setNewPlayerUsername(e.target.value)}
              />
              <button type="submit">Create Player</button>
            </form>
          </div>

          <div className="list-section">
            <h2>Players ({players.length})</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="admin-list">
                {players.map(player => (
                  <div key={player.id} className="admin-item">
                    <div className="item-info">
                      <h3>{player.username}</h3>
                      <p>Skin: {player.character_skin}</p>
                      <p>Highscore: {player.highscore}</p>
                      <p>ID: {player.id}</p>
                    </div>
                    <button
                      onClick={() => deletePlayer(player.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

