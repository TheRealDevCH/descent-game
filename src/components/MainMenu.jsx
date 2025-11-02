import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';
import Shop from './Shop';
import CharacterEditor from './CharacterEditor';
import MainMenuBackground from './MainMenuBackground';
import './MainMenu.css';

function MainMenu() {
  const { t } = useTranslation();
  const [showShop, setShowShop] = useState(false);
  const [showCharacterEditor, setShowCharacterEditor] = useState(false);
  const startGame = useGameStore(state => state.startGame);

  useEffect(() => {
    audioSystem.init();

    const playPromise = audioSystem.playMenuMusic();
    if (playPromise) {
      playPromise.catch(err => {
        console.log('Menu music autoplay blocked - will play on first interaction');
      });
    }

    return () => {
    };
  }, []);

  const handlePlay = () => {
    audioSystem.playSound('click');

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

  const handleCharacterEditor = () => {
    audioSystem.playSound('click');
    setShowCharacterEditor(true);
  };

  if (showShop) {
    return <Shop onClose={() => setShowShop(false)} />;
  }

  if (showCharacterEditor) {
    return <CharacterEditor onClose={() => setShowCharacterEditor(false)} />;
  }

  return (
    <div className="main-menu fade-in">
      <MainMenuBackground />

      <div className="menu-overlay"></div>

      <div className="menu-content">
        <div className="title-container">
          <h1 className="game-title">{t('menu.title')}</h1>
          <p className="subtitle">{t('menu.subtitle')}</p>
        </div>

        <div className="menu-buttons">
          <button className="button button-play" onClick={handlePlay}>
            {t('menu.play')}
          </button>
          <button className="button button-secondary" onClick={handleCharacterEditor}>
            👤 CHARACTER
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
    </div>
  );
}

export default MainMenu;

