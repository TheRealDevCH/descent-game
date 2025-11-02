import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';
import Shop from './Shop';
import './MainMenu.css';

function MainMenu() {
  const { t } = useTranslation();
  const [showShop, setShowShop] = useState(false);
  const startGame = useGameStore(state => state.startGame);

  // Play menu music when component mounts
  useEffect(() => {
    audioSystem.init();

    // Try to play menu music, but it might be blocked by browser
    const playPromise = audioSystem.playMenuMusic();
    if (playPromise) {
      playPromise.catch(err => {
        console.log('Menu music autoplay blocked - will play on first interaction');
      });
    }

    return () => {
      // Don't stop music on unmount - let Game component handle it
    };
  }, []);

  const handlePlay = () => {
    audioSystem.playSound('click');

    // Try to start menu music on user interaction if it wasn't playing
    if (audioSystem.menuMusic && audioSystem.menuMusic.paused) {
      audioSystem.playMenuMusic();
    }

    startGame();
  };

  const handleSettings = () => {
    audioSystem.playSound('click');
    useGameStore.setState({ gameState: 'settings' });
  };

  const handleHowToPlay = () => {
    audioSystem.playSound('click');
    useGameStore.setState({ gameState: 'howToPlay' });
  };

  const handleShop = () => {
    audioSystem.playSound('click');
    setShowShop(true);
  };

  if (showShop) {
    return <Shop onClose={() => setShowShop(false)} />;
  }

  return (
    <div className="main-menu fade-in">
      <div className="menu-content">
        <div className="title-container">
          <h1 className="game-title">{t('menu.title')}</h1>
          <p className="subtitle">{t('menu.subtitle')}</p>
        </div>
        
        <div className="menu-buttons">
          <button className="button button-play" onClick={handlePlay}>
            {t('menu.play')}
          </button>
          <button className="button button-secondary" onClick={handleShop}>
            🛍️ SHOP
          </button>
          <button className="button button-secondary" onClick={handleHowToPlay}>
            {t('menu.howToPlay')}
          </button>
          <button className="button button-secondary" onClick={handleSettings}>
            {t('menu.settings')}
          </button>
        </div>
      </div>
      
      <div className="background-animation">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    </div>
  );
}

export default MainMenu;

