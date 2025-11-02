import { useState } from 'react';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';
import ServerBrowser from './ServerBrowser';
import Lobby from './Lobby';
import './GameModeSelection.css';

function GameModeSelection() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const startGame = useGameStore(state => state.startGame);

  const handleSingleplayer = () => {
    audioSystem.playSound('click');
    localStorage.setItem('gameMode', 'singleplayer');
    localStorage.removeItem('serverId');
    startGame();
  };

  const handleMultiplayer = () => {
    audioSystem.playSound('click');
    setSelectedMode('multiplayer');
  };

  const handleBackFromMultiplayer = () => {
    audioSystem.playSound('click');
    setSelectedMode(null);
  };

  const handleServerSelected = (serverId, serverData) => {
    audioSystem.playSound('click');
    localStorage.setItem('gameMode', 'multiplayer');
    localStorage.setItem('serverId', serverId);
    setSelectedServer({ id: serverId, data: serverData });
    setSelectedMode('lobby');
  };

  const handleGameStart = () => {
    audioSystem.playSound('click');
    startGame();
  };

  const handleBackFromLobby = () => {
    audioSystem.playSound('click');
    setSelectedServer(null);
    setSelectedMode('multiplayer');
  };

  if (selectedMode === 'lobby' && selectedServer) {
    return (
      <Lobby
        serverId={selectedServer.id}
        serverData={selectedServer.data}
        onGameStart={handleGameStart}
        onBack={handleBackFromLobby}
      />
    );
  }

  if (selectedMode === 'multiplayer') {
    return (
      <ServerBrowser
        onBack={handleBackFromMultiplayer}
        onServerSelected={handleServerSelected}
      />
    );
  }

  return (
    <div className="game-mode-selection">
      <div className="mode-container">
        <h1 className="selection-title">SELECT GAME MODE</h1>
        
        <div className="modes-grid">
          {/* SINGLEPLAYER */}
          <button 
            className="mode-card singleplayer-card"
            onClick={handleSingleplayer}
          >
            <div className="mode-icon">🎮</div>
            <div className="mode-content">
              <h2 className="mode-title">SINGLEPLAYER</h2>
              <p className="mode-description">
                Play alone and reach the top of the leaderboard
              </p>
              <div className="mode-features">
                <div className="feature">✓ Solo Challenge</div>
                <div className="feature">✓ Endless Falling</div>
                <div className="feature">✓ Powerups</div>
              </div>
            </div>
            <div className="mode-arrow">→</div>
          </button>

          {/* MULTIPLAYER */}
          <button 
            className="mode-card multiplayer-card"
            onClick={handleMultiplayer}
          >
            <div className="mode-icon">👥</div>
            <div className="mode-content">
              <h2 className="mode-title">MULTIPLAYER</h2>
              <p className="mode-description">
                Battle with friends in public or private servers
              </p>
              <div className="mode-features">
                <div className="feature">✓ Public Servers</div>
                <div className="feature">✓ Private Lobbies</div>
                <div className="feature">✓ PvP Combat</div>
              </div>
            </div>
            <div className="mode-arrow">→</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameModeSelection;

