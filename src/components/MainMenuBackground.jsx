import { useEffect, useRef } from 'react';
import GameEngine from '../game/GameEngine';
import useGameStore from '../store/gameStore';
import audioSystem from '../utils/audioSystem';

function MainMenuBackground() {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || engineRef.current) return;

    audioSystem.init();

    const mockGameStore = {
      getState: () => ({
        gameState: 'menu-background',
        depth: 0,
        speed: 1,
        playerX: Math.sin(Date.now() / 3000) * 0.5,
        lastMilestone: 0,
      }),
      setState: () => {},
    };

    engineRef.current = new GameEngine(
      containerRef.current,
      mockGameStore,
      audioSystem
    );

    const animationInterval = setInterval(() => {
      if (engineRef.current && engineRef.current.gameStore) {
        const state = engineRef.current.gameStore.getState();
        state.depth += 50;
        state.speed = 1 + (state.depth / 2000);
        state.playerX = Math.sin(Date.now() / 3000) * 0.5;
      }
    }, 16);

    return () => {
      clearInterval(animationInterval);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}

export default MainMenuBackground;

