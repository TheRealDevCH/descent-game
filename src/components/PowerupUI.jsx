import { useState, useEffect } from 'react';
import './PowerupUI.css';

function PowerupUI({ gameEngine }) {
  const [powerupState, setPowerupState] = useState({
    isActive: false,
    cooldownRemaining: 0,
    durationRemaining: 0,
  });

  useEffect(() => {
    if (!gameEngine || !gameEngine.powerupSystem) return;

    const updatePowerupUI = () => {
      const isActive = gameEngine.powerupSystem.isPowerupActive('player');
      const cooldown = gameEngine.powerupSystem.getPowerupCooldown('player');

      let durationRemaining = 0;
      if (isActive) {
        const powerup = gameEngine.powerupSystem.activePowerups.get('player');
        if (powerup) {
          durationRemaining = Math.ceil((powerup.expiresAt - Date.now()) / 1000);
        }
      }

      setPowerupState({
        isActive,
        cooldownRemaining: cooldown,
        durationRemaining,
      });
    };

    const interval = setInterval(updatePowerupUI, 100);
    return () => clearInterval(interval);
  }, [gameEngine]);

  const { isActive, cooldownRemaining, durationRemaining } = powerupState;

  if (isActive) {
    return (
      <div className="powerup-ui powerup-active">
        <div className="powerup-icon-container">
          <div className="powerup-icon">⚡</div>
          <div className="powerup-key">ACTIVE</div>
        </div>
        <div className="powerup-content">
          <div className="powerup-title">SUPER SAIYAN MODE</div>
          <div className="powerup-timer">{durationRemaining}s</div>
        </div>
        <div className="powerup-glow"></div>
      </div>
    );
  }

  if (cooldownRemaining > 0) {
    const cooldownPercent = ((25 - cooldownRemaining) / 25) * 100;
    return (
      <div className="powerup-ui powerup-cooldown">
        <div className="powerup-icon-container">
          <div className="powerup-icon">⚡</div>
          <div className="powerup-cooldown-ring" style={{ background: `conic-gradient(rgba(255, 215, 0, 0.8) ${cooldownPercent}%, rgba(100, 100, 100, 0.3) ${cooldownPercent}%)` }}></div>
          <div className="powerup-key">SPACE</div>
        </div>
        <div className="powerup-content">
          <div className="powerup-title">COOLDOWN</div>
          <div className="powerup-timer">{cooldownRemaining}s</div>
        </div>
      </div>
    );
  }

  return (
    <div className="powerup-ui powerup-ready">
      <div className="powerup-icon-container">
        <div className="powerup-icon">⚡</div>
        <div className="powerup-key">SPACE</div>
      </div>
      <div className="powerup-content">
        <div className="powerup-title">POWERUP READY</div>
        <div className="powerup-subtitle">Press SPACE to activate!</div>
      </div>
    </div>
  );
}

export default PowerupUI;

