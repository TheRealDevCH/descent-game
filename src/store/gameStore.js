import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // Game state
  gameState: 'menu', // 'menu', 'playing', 'paused', 'gameOver'
  depth: 0,
  speed: 1,
  score: 0,
  highScore: parseInt(localStorage.getItem('highScore') || '0'),
  
  // Settings
  musicEnabled: localStorage.getItem('musicEnabled') !== 'false',
  sfxEnabled: localStorage.getItem('sfxEnabled') !== 'false',
  
  // Player position
  playerX: 0,
  
  // Milestones
  lastMilestone: 0,

  // Death replay data
  deathReplay: null,

  // Actions
  startGame: () => {
    set({
      gameState: 'playing',
      depth: 0,
      speed: 1,
      score: 0,
      playerX: 0,
      lastMilestone: 0
    });
  },
  
  pauseGame: () => {
    const state = get().gameState;
    if (state === 'playing') {
      set({ gameState: 'paused' });
    } else if (state === 'paused') {
      set({ gameState: 'playing' });
    }
  },
  
  endGame: () => {
    const { depth, highScore } = get();
    const newHighScore = Math.max(depth, highScore);
    
    if (newHighScore > highScore) {
      localStorage.setItem('highScore', newHighScore.toString());
    }
    
    set({
      gameState: 'gameOver',
      highScore: newHighScore
    });
  },
  
  returnToMenu: () => {
    set({
      gameState: 'menu',
      depth: 0,
      speed: 1,
      score: 0,
      playerX: 0,
      lastMilestone: 0
    });
  },
  
  updateDepth: (newDepth) => {
    const { lastMilestone } = get();
    const milestone = Math.floor(newDepth / 1000) * 1000;

    // Speed increases based on depth
    // At 3000m (typical song length ~180s), speed will be ~2.5x
    set({
      depth: newDepth,
      speed: 1 + (newDepth / 2000),
      lastMilestone: milestone > lastMilestone ? milestone : lastMilestone
    });
  },
  
  updatePlayerX: (x) => {
    set({ playerX: Math.max(-1, Math.min(1, x)) });
  },

  setDeathReplay: (replayData) => {
    set({ deathReplay: replayData });
  },

  toggleMusic: () => {
    const newValue = !get().musicEnabled;
    localStorage.setItem('musicEnabled', newValue.toString());
    set({ musicEnabled: newValue });
  },
  
  toggleSFX: () => {
    const newValue = !get().sfxEnabled;
    localStorage.setItem('sfxEnabled', newValue.toString());
    set({ sfxEnabled: newValue });
  }
}));

export default useGameStore;

