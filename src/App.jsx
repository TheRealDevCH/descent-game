import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useGameStore from './store/gameStore';
import MainMenu from './components/MainMenu';
import Game from './components/Game';
import GameOver from './components/GameOver';
import Settings from './components/Settings';
import HowToPlay from './components/HowToPlay';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const gameState = useGameStore(state => state.gameState);

  useEffect(() => {
    // Set initial language from localStorage or default to German
    const savedLanguage = localStorage.getItem('language') || 'de';
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  return (
    <div className="app">
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'settings' && <Settings />}
      {gameState === 'howToPlay' && <HowToPlay />}
      {(gameState === 'playing' || gameState === 'paused') && <Game />}
      {gameState === 'gameOver' && <GameOver />}
    </div>
  );
}

export default App;

