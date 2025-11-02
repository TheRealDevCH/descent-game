import { useTranslation } from 'react-i18next';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';
import './Settings.css';

function Settings() {
  const { t, i18n } = useTranslation();
  const musicEnabled = useGameStore(state => state.musicEnabled);
  const sfxEnabled = useGameStore(state => state.sfxEnabled);
  const toggleMusic = useGameStore(state => state.toggleMusic);
  const toggleSFX = useGameStore(state => state.toggleSFX);

  const handleBack = () => {
    audioSystem.playSound('click');
    useGameStore.setState({ gameState: 'menu' });
  };

  const handleLanguageChange = (lang) => {
    audioSystem.playSound('click');
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleToggleMusic = () => {
    audioSystem.playSound('click');
    toggleMusic();
    audioSystem.setMusicEnabled(!musicEnabled);
  };

  const handleToggleSFX = () => {
    const newValue = !sfxEnabled;
    toggleSFX();
    audioSystem.setSFXEnabled(newValue);
    if (newValue) {
      audioSystem.playSound('click');
    }
  };

  return (
    <div className="settings fade-in">
      <div className="settings-content glass">
        <h2>{t('settings.title')}</h2>
        
        <div className="settings-section">
          <h3>{t('settings.language')}</h3>
          <div className="language-buttons">
            <button
              className={`button ${i18n.language === 'de' ? 'button-active' : 'button-secondary'}`}
              onClick={() => handleLanguageChange('de')}
            >
              Deutsch
            </button>
            <button
              className={`button ${i18n.language === 'en' ? 'button-active' : 'button-secondary'}`}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
            <button
              className={`button ${i18n.language === 'fr' ? 'button-active' : 'button-secondary'}`}
              onClick={() => handleLanguageChange('fr')}
            >
              Français
            </button>
          </div>
        </div>
        
        <div className="settings-section">
          <div className="setting-item">
            <span className="setting-label">{t('settings.music')}</span>
            <button
              className={`toggle-button ${musicEnabled ? 'active' : ''}`}
              onClick={handleToggleMusic}
            >
              <span className="toggle-text">
                {musicEnabled ? t('settings.on') : t('settings.off')}
              </span>
              <span className="toggle-slider"></span>
            </button>
          </div>
          
          <div className="setting-item">
            <span className="setting-label">{t('settings.soundEffects')}</span>
            <button
              className={`toggle-button ${sfxEnabled ? 'active' : ''}`}
              onClick={handleToggleSFX}
            >
              <span className="toggle-text">
                {sfxEnabled ? t('settings.on') : t('settings.off')}
              </span>
              <span className="toggle-slider"></span>
            </button>
          </div>
        </div>
        
        <button className="button button-secondary" onClick={handleBack}>
          {t('settings.back')}
        </button>
      </div>
    </div>
  );
}

export default Settings;

