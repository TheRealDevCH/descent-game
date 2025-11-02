import { useState, useEffect } from 'react';
import multiplayerService from '../utils/multiplayerService';
import './Lobby.css';

function Lobby({ serverId, serverData, onGameStart, onBack }) {
  const [players, setPlayers] = useState([]);
  const [isLeader, setIsLeader] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Join the server if not already joined
    const joinServer = async () => {
      try {
        await fetch('/api/multiplayer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'joinServer',
            playerId: multiplayerService.playerId,
            serverId: serverId
          })
        });
      } catch (error) {
        console.error('Error joining server:', error);
      }
    };

    joinServer();
  }, [serverId]);

  useEffect(() => {
    // Check if current player is the leader (first player to join)
    const checkLeader = async () => {
      try {
        const response = await fetch('/api/multiplayer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getServerPlayers',
            serverId: serverId
          })
        });

        const data = await response.json();
        const serverPlayers = data.players || [];

        // First player in the list is the leader
        if (serverPlayers.length > 0) {
          const firstPlayerId = serverPlayers[0].player_id;
          const currentPlayerId = multiplayerService.playerId;
          const isCurrentPlayerLeader = firstPlayerId === currentPlayerId;

          setIsLeader(isCurrentPlayerLeader);

          // If not leader and game has started, auto-join game
          if (!isCurrentPlayerLeader && serverPlayers.length > 0) {
            // Check if leader has started the game by polling
            // We'll use a simple flag: if we're in lobby and leader exists, wait for signal
          }
        }

        setPlayers(serverPlayers);
      } catch (error) {
        console.error('Error checking leader:', error);
      }
    };

    checkLeader();

    // Poll for player updates every 500ms
    const interval = setInterval(checkLeader, 500);
    return () => clearInterval(interval);
  }, [serverId, onGameStart]);

  useEffect(() => {
    // Get invite code if server is private
    if (serverData?.isPrivate && serverData?.inviteCode) {
      setInviteCode(serverData.inviteCode);
    }
  }, [serverData]);

  // For non-leaders: watch for game start signal
  useEffect(() => {
    if (isLeader) return; // Only for non-leaders

    const checkGameStart = () => {
      const gameStarted = localStorage.getItem(`gameStarted_${serverId}`);
      if (gameStarted === 'true') {
        // Clear the signal
        localStorage.removeItem(`gameStarted_${serverId}`);
        localStorage.removeItem(`gameStartedAt_${serverId}`);
        // Auto-join the game
        onGameStart();
      }
    };

    // Check every 100ms for game start signal
    const interval = setInterval(checkGameStart, 100);
    return () => clearInterval(interval);
  }, [isLeader, serverId, onGameStart]);

  const handleStartGame = async () => {
    if (!isLeader) return;

    setLoading(true);
    try {
      // Store game start signal in localStorage for all players to see
      localStorage.setItem(`gameStarted_${serverId}`, 'true');
      localStorage.setItem(`gameStartedAt_${serverId}`, new Date().toISOString());

      // Update server status to 'playing'
      await fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'startGame',
          serverId: serverId
        })
      });

      // Give a small delay for other clients to see the signal
      setTimeout(() => {
        onGameStart();
      }, 100);
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    alert('Invite code copied to clipboard!');
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>{serverData?.name || 'Lobby'}</h1>
        <button className="button button-secondary" onClick={onBack}>
          Back
        </button>
      </div>

      {/* Invite Code Display - Only for Private Servers */}
      {serverData?.isPrivate && inviteCode && (
        <div className="invite-code-section">
          <h3>Invite Code</h3>
          <div className="invite-code-display">
            <code>{inviteCode}</code>
            <button className="button button-small" onClick={copyInviteCode}>
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="lobby-content">
        <h2>Players ({players.length}/50)</h2>
        <div className="players-grid">
          {players.map((player, index) => (
            <div key={player.player_id} className={`player-card ${index === 0 ? 'leader' : ''}`}>
              <div className="player-avatar">
                {index === 0 && <span className="leader-badge">👑</span>}
                <div className="avatar-icon">👤</div>
              </div>
              <div className="player-info">
                <p className="player-name">{player.players?.username || 'Player'}</p>
                {index === 0 && <p className="player-role">Leader</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Game Button - Only for Leader */}
      {isLeader && (
        <div className="lobby-actions">
          <button
            className="button button-play button-large"
            onClick={handleStartGame}
            disabled={loading || players.length === 0}
          >
            {loading ? 'Starting...' : 'START GAME'}
          </button>
        </div>
      )}

      {!isLeader && (
        <div className="lobby-actions">
          <p className="waiting-text">Waiting for leader to start the game...</p>
        </div>
      )}
    </div>
  );
}

export default Lobby;

