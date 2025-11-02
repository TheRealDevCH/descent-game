import { useTranslation } from 'react-i18next';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';
import DeathReplay from './DeathReplay';
import './GameOver.css';

function GameOver() {
  const { t } = useTranslation();
  const depth = useGameStore(state => state.depth);
  const highScore = useGameStore(state => state.highScore);
  const deathReplay = useGameStore(state => state.deathReplay);
  const startGame = useGameStore(state => state.startGame);
  const returnToMenu = useGameStore(state => state.returnToMenu);

  const isNewRecord = Math.floor(depth) === highScore && highScore > 0;

  const handlePlayAgain = () => {
    audioSystem.playSound('click');
    startGame();
  };

  const handleMainMenu = () => {
    audioSystem.playSound('click');
    audioSystem.stopAllMusic();
    returnToMenu();
  };

  return (
    <div className="game-over fade-in">
      <div className="game-over-content glass">
        <h1 className="game-over-title">{t('gameOver.title')}</h1>
        
        {isNewRecord && (
          <div className="new-record">
            <h2>{t('gameOver.newRecord')}</h2>
          </div>
        )}
        
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">{t('gameOver.yourDepth')}</span>
            <span className="stat-value">{Math.floor(depth)}m</span>
          </div>
          
          <div className="stat-divider"></div>
          
          <div className="stat-item">
            <span className="stat-label">{t('gameOver.personalBest')}</span>
            <span className="stat-value highlight">{highScore}m</span>
          </div>
        </div>

        {/* Death Replay */}
        {deathReplay && <DeathReplay replayData={deathReplay} />}

        <div className="game-over-buttons">
          <button className="button button-play" onClick={handlePlayAgain}>
            {t('gameOver.playAgain')}
          </button>
          <button className="button button-secondary" onClick={handleMainMenu}>
            {t('gameOver.mainMenu')}
          </button>
        </div>
      </div>
      
      <div className="background-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default GameOver;

