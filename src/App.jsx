import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useGameStore from './store/gameStore';
import multiplayerService from './utils/multiplayerService';
import MainMenu from './components/MainMenu';
import Game from './components/Game';
import GameOver from './components/GameOver';
import Settings from './components/Settings';
import HowToPlay from './components/HowToPlay';
import UsernameInput from './components/UsernameInput';
import CharacterCustomization from './components/CharacterCustomization';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const gameState = useGameStore(state => state.gameState);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [showCharacterCustomization, setShowCharacterCustomization] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'de';
    i18n.changeLanguage(savedLanguage);

    if (!multiplayerService.isLoggedIn()) {
      setShowUsernameInput(true);
    } else if (!localStorage.getItem('characterCustomized')) {
      setShowCharacterCustomization(true);
    }
  }, [i18n]);

  if (showUsernameInput) {
    return (
      <div className="app">
        <UsernameInput onComplete={() => setShowUsernameInput(false)} />
      </div>
    );
  }

  if (showCharacterCustomization) {
    return (
      <div className="app">
        <CharacterCustomization
          username={multiplayerService.username}
          onComplete={() => {
            localStorage.setItem('characterCustomized', 'true');
            setShowCharacterCustomization(false);
          }}
        />
      </div>
    );
  }

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

