import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/gameStore';
import GameEngine from '../game/GameEngine';
import audioSystem from '../utils/audioSystem';
import multiplayerService from '../utils/multiplayerService';
import PowerupUI from './PowerupUI';
import './Game.css';

function Game() {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [showMilestone, setShowMilestone] = useState(null);
  const [serverId, setServerId] = useState(null);

  const gameState = useGameStore(state => state.gameState);
  const depth = useGameStore(state => state.depth);
  const speed = useGameStore(state => state.speed);
  const highScore = useGameStore(state => state.highScore);
  const pauseGame = useGameStore(state => state.pauseGame);
  const returnToMenu = useGameStore(state => state.returnToMenu);
  const updatePlayerX = useGameStore(state => state.updatePlayerX);

  // Get serverId from localStorage
  useEffect(() => {
    const id = localStorage.getItem('serverId');
    setServerId(id);
  }, []);

  // Register player in server when game starts
  useEffect(() => {
    if (gameState === 'playing' && serverId && multiplayerService.playerId) {
      multiplayerService.joinServer(serverId);
    }
  }, [gameState, serverId]);

  // Initialize game engine once
  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;

    audioSystem.init();

    engineRef.current = new GameEngine(
      containerRef.current,
      useGameStore,
      audioSystem,
      serverId
    );

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
      audioSystem.stopMusic();
    };
  }, [serverId]);

  // Handle game state changes
  useEffect(() => {
    if (!engineRef.current) return;

    if (gameState === 'playing') {
      engineRef.current.reset();
      audioSystem.playGameplayMusic();

      // End game when music ends
      if (audioSystem.gameplayMusic) {
        const handleMusicEnd = () => {
          console.log('Music ended - game over!');
          useGameStore.getState().endGame();
        };

        audioSystem.gameplayMusic.addEventListener('ended', handleMusicEnd);

        return () => {
          if (audioSystem.gameplayMusic) {
            audioSystem.gameplayMusic.removeEventListener('ended', handleMusicEnd);
          }
        };
      }
    }
  }, [gameState]);

  // Setup controls
  useEffect(() => {
    const keysPressed = {};

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        pauseGame();
        return;
      }

      if (gameState !== 'playing') return;
      keysPressed[e.key] = true;
    };

    const handleKeyUp = (e) => {
      keysPressed[e.key] = false;
    };

    // Mouse movement controls
    const handleMouseMove = (e) => {
      if (gameState !== 'playing') return;

      const screenWidth = window.innerWidth;
      const mouseX = e.clientX;

      // Convert mouse position to -1 to 1 range
      const normalizedX = (mouseX / screenWidth) * 2 - 1;
      updatePlayerX(normalizedX);
    };

    // Continuous keyboard movement
    const keyboardInterval = setInterval(() => {
      if (gameState !== 'playing') return;

      const state = useGameStore.getState();
      let newX = state.playerX;

      // Left movement: Arrow Left, A, or W
      if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A'] || keysPressed['w'] || keysPressed['W']) {
        newX = Math.max(-1, state.playerX - 0.05);
      }
      // Right movement: Arrow Right, D, or S
      if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D'] || keysPressed['s'] || keysPressed['S']) {
        newX = Math.min(1, state.playerX + 0.05);
      }

      if (newX !== state.playerX) {
        updatePlayerX(newX);
      }
    }, 16);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(keyboardInterval);
    };
  }, [gameState, pauseGame, updatePlayerX]);

  // Show milestone notifications
  useEffect(() => {
    const milestone = Math.floor(depth / 1000) * 1000;
    
    if (milestone > 0 && milestone % 1000 === 0 && depth >= milestone && depth < milestone + 50) {
      const key = `depth${milestone}`;
      if (t(`milestones.${key}`) !== `milestones.${key}`) {
        setShowMilestone(t(`milestones.${key}`));
        
        setTimeout(() => {
          setShowMilestone(null);
        }, 2000);
      }
    }
  }, [depth, t]);

  const handleResume = () => {
    audioSystem.playSound('click');
    pauseGame();
  };

  const handleRestart = () => {
    audioSystem.playSound('click');
    if (engineRef.current) {
      engineRef.current.reset();
    }
    useGameStore.getState().startGame();
  };

  const handleMainMenu = () => {
    audioSystem.playSound('click');
    audioSystem.stopAllMusic();
    returnToMenu();
  };

  return (
    <div className="game-container">
      <div ref={containerRef} className="game-canvas"></div>

      {/* HUD - Only show when playing */}
      {gameState === 'playing' && (
        <div className="hud">
        <div className="hud-left">
          <div className="depth-meter">
            <div className="depth-label">{t('game.depth')}</div>
            <div className="depth-value">{Math.floor(depth)}m</div>
            <div className="depth-bar-container">
              <div className="depth-bar-bg">
                <div
                  className="depth-bar-fill"
                  style={{ height: `${Math.min((depth / 10000) * 100, 100)}%` }}
                ></div>
                <div className="depth-markers">
                  <div className="depth-marker" style={{ bottom: '80%' }}>2000m</div>
                  <div className="depth-marker" style={{ bottom: '60%' }}>4000m</div>
                  <div className="depth-marker" style={{ bottom: '40%' }}>6000m</div>
                  <div className="depth-marker" style={{ bottom: '20%' }}>8000m</div>
                  <div className="depth-marker" style={{ bottom: '0%' }}>10000m</div>
                </div>
                <div className="player-indicator" style={{ bottom: `${Math.min((depth / 10000) * 100, 100)}%` }}>
                  <div className="player-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hud-right">
          <div className="hud-item">
            <div className="hud-label">{t('game.speed')}</div>
            <div className="hud-value">{speed.toFixed(1)}x</div>
          </div>
          <div className="hud-item">
            <div className="hud-label">{t('game.highscore')}</div>
            <div className="hud-value">{highScore}m</div>
          </div>
        </div>
        </div>
      )}

      {/* Milestone notification */}
      {showMilestone && (
        <div className="milestone-notification fade-in">
          <h2>{showMilestone}</h2>
        </div>
      )}
      
      {/* Pause menu */}
      {gameState === 'paused' && (
        <div className="pause-menu fade-in">
          <div className="pause-content glass">
            <h2>{t('game.paused')}</h2>
            <div className="pause-buttons">
              <button className="button" onClick={handleResume}>
                {t('game.resume')}
              </button>
              <button className="button button-secondary" onClick={handleRestart}>
                {t('game.restart')}
              </button>
              <button className="button button-secondary" onClick={handleMainMenu}>
                {t('game.mainMenu')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Powerup UI */}
      {gameState === 'playing' && <PowerupUI gameEngine={engineRef.current} />}

      {/* PC controls hint */}
      <div className="pc-controls-hint">
        <div className="control-hint-item">
          <span className="control-key">W</span>
          <span className="control-key">A</span>
          <span className="control-key">S</span>
          <span className="control-key">D</span>
          <span className="control-text">oder</span>
          <span className="control-key">←</span>
          <span className="control-key">→</span>
          <span className="control-text">oder Maus</span>
        </div>
        <div className="control-hint-item">
          <span className="control-key">ESC</span>
          <span className="control-text">Pause</span>
        </div>
      </div>
    </div>
  );
}

export default Game;

