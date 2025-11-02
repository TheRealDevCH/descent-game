import { useTranslation } from 'react-i18next';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';
import './HowToPlay.css';

function HowToPlay() {
  const { t } = useTranslation();

  const handleBack = () => {
    audioSystem.playSound('click');
    useGameStore.setState({ gameState: 'menu' });
  };

  return (
    <div className="how-to-play fade-in">
      <div className="how-to-play-content glass">
        <h2>{t('howToPlay.title')}</h2>

        <div className="instruction-section">
          <p className="description">{t('howToPlay.description')}</p>
        </div>

        {/* GAME MODES */}
        <div className="instruction-section">
          <h3>{t('howToPlay.gameModes')}</h3>
          <div className="game-modes-list">
            <div className="mode-item">
              <div className="mode-icon">🎮</div>
              <div className="mode-info">
                <h4>{t('howToPlay.singleplayer')}</h4>
                <p>{t('howToPlay.singleplayerDesc')}</p>
              </div>
            </div>
            <div className="mode-item">
              <div className="mode-icon">👥</div>
              <div className="mode-info">
                <h4>{t('howToPlay.multiplayer')}</h4>
                <p>{t('howToPlay.multiplayerDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="instruction-section">
          <h3>{t('howToPlay.controls')}</h3>
          <div className="controls-list">
            <div className="control-item">
              <div className="control-icon">⌨️</div>
              <p>{t('howToPlay.desktop')}</p>
            </div>
            <div className="control-item">
              <div className="control-icon">📱</div>
              <p>{t('howToPlay.mobile')}</p>
            </div>
          </div>
        </div>

        {/* POWERUP SYSTEM */}
        <div className="instruction-section">
          <h3>{t('howToPlay.powerups')}</h3>
          <div className="powerup-info">
            <p>{t('howToPlay.powerupDesc')}</p>
            <div className="powerup-details">
              <div className="powerup-item">
                <span className="powerup-icon">⚡</span>
                <span>{t('howToPlay.powerupEffect')}</span>
              </div>
              <div className="powerup-item">
                <span className="powerup-icon">⏱️</span>
                <span>{t('howToPlay.powerupCooldown')}</span>
              </div>
              <div className="powerup-item">
                <span className="powerup-icon">SPACE</span>
                <span>{t('howToPlay.powerupActivate')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="instruction-section">
          <div className="objective-box">
            <p className="objective">{t('howToPlay.objective')}</p>
          </div>
        </div>

        <div className="instruction-section">
          <h3>{t('howToPlay.tips')}</h3>
          <ul className="tips-list">
            <li>{t('howToPlay.tip1')}</li>
            <li>{t('howToPlay.tip2')}</li>
            <li>{t('howToPlay.tip3')}</li>
            <li>{t('howToPlay.tip4')}</li>
            <li>{t('howToPlay.tip5')}</li>
          </ul>
        </div>

        <button className="button button-secondary" onClick={handleBack}>
          {t('howToPlay.back')}
        </button>
      </div>
    </div>
  );
}

export default HowToPlay;

