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

